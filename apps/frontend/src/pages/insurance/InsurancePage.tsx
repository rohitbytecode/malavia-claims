import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insuranceApi } from "../../api/services";
import { DataTable, type Column } from "../../components/tables/DataTable";
import { ErrorPanel } from "../../components/ui/ErrorPanel";
import { Skeleton } from "../../components/ui/Skeleton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Field, TextArea, TextInput } from "../../components/forms/FormField";
import type { InsuranceCompany, SubmissionMethod } from "../../types/domain";
import { labelize } from "../../utils/format";

type CompanyDraft = {
  name: string;
  submissionMethods: SubmissionMethod[];
  portalUrl: string;
  portalUsername: string;
  portalPassword: string;
  email: string;
  courierAddress: string;
  tatDays: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  remarks: string;
  isActive: boolean;
};
const blank: CompanyDraft = {
  name: "",
  submissionMethods: ["PORTAL"],
  portalUrl: "",
  portalUsername: "",
  portalPassword: "",
  email: "",
  courierAddress: "",
  tatDays: 0,
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  remarks: "",
  isActive: true,
};
const methods: SubmissionMethod[] = ["PORTAL", "EMAIL", "COURIER"];

function toPayload(draft: CompanyDraft) {
  return {
    name: draft.name,
    submissionMethods: draft.submissionMethods,
    portalUrl: draft.portalUrl || undefined,
    portalUsername: draft.portalUsername || undefined,
    portalPassword: draft.portalPassword || undefined,
    email: draft.email || undefined,
    courierAddress: draft.courierAddress || undefined,
    tatDays: Number(draft.tatDays) || 0,
    remarks: draft.remarks,
    isActive: draft.isActive,
    contactPersons:
      draft.contactName && draft.contactEmail && draft.contactPhone
        ? [
            {
              name: draft.contactName,
              email: draft.contactEmail,
              phone: draft.contactPhone,
            },
          ]
        : [],
    escalationMatrix: [],
  };
}

export function InsurancePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InsuranceCompany | null>(null);
  const [draft, setDraft] = useState<CompanyDraft>(blank);
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["insurance"],
    queryFn: () => insuranceApi.list({ limit: 100 }),
  });
  const save = useMutation({
    mutationFn: () =>
      editing
        ? insuranceApi.update(editing._id, toPayload(draft))
        : insuranceApi.create(toPayload(draft)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["insurance"] });
      closeModal();
    },
  });
  const remove = useMutation({
    mutationFn: insuranceApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["insurance"] }),
  });
  const openCreate = () => {
    setEditing(null);
    setDraft(blank);
    setModalOpen(true);
  };
  const openEdit = (company: InsuranceCompany) => {
    const contact = company.contactPersons[0];
    setEditing(company);
    setDraft({
      name: company.name,
      submissionMethods: company.submissionMethods,
      portalUrl: company.portalUrl ?? "",
      portalUsername: company.portalUsername ?? "",
      portalPassword: "",
      email: company.email ?? "",
      courierAddress: company.courierAddress ?? "",
      tatDays: company.tatDays ?? 0,
      contactName: contact?.name ?? "",
      contactEmail: contact?.email ?? "",
      contactPhone: contact?.phone ?? "",
      remarks: company.remarks ?? "",
      isActive: company.isActive,
    });
    setModalOpen(true);
  };
  const closeModal = () => {
    setEditing(null);
    setDraft(blank);
    setModalOpen(false);
  };
  const toggleMethod = (method: SubmissionMethod) =>
    setDraft((d) => {
      const has = d.submissionMethods.includes(method);
      const next = has
        ? d.submissionMethods.filter((item) => item !== method)
        : [...d.submissionMethods, method];
      return { ...d, submissionMethods: next.length ? next : [method] };
    });
  const columns: Column<InsuranceCompany>[] = [
    {
      key: "name",
      header: "Company",
      cell: (c) => <strong>{c.name}</strong>,
      sortValue: (c) => c.name,
      searchValue: (c) => c.name,
    },
    {
      key: "methods",
      header: "Submission",
      cell: (c) => (
        <div className="chip-cloud">
          {c.submissionMethods.map((m) => (
            <StatusBadge key={m} value={m} compact />
          ))}
        </div>
      ),
      sortValue: (c) => c.submissionMethods.join(","),
    },
    {
      key: "tat",
      header: "TAT",
      cell: (c) => `${c.tatDays ?? 0} days`,
      sortValue: (c) => c.tatDays ?? 0,
    },
    {
      key: "contact",
      header: "Contact",
      cell: (c) => c.email ?? c.contactPersons[0]?.email ?? "—",
      sortValue: (c) => c.email ?? "",
      searchValue: (c) =>
        `${c.email ?? ""} ${c.contactPersons[0]?.email ?? ""}`,
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => labelize(c.isActive ? "ACTIVE" : "INACTIVE"),
      sortValue: (c) => String(c.isActive),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (c) => (
        <div className="chip-cloud">
          <Button type="button" variant="secondary" onClick={() => openEdit(c)}>
            Edit
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => remove.mutate(c._id)}
            disabled={remove.isPending}
          >
            Disable
          </Button>
        </div>
      ),
    },
  ];
  if (query.isLoading) return <Skeleton rows={8} />;
  if (query.isError) return <ErrorPanel error={query.error} />;
  const rows = query.data?.data ?? [];
  return (
    <div className="page-stack">
      <div className="page-title">
        <p className="eyebrow">Payer master data</p>
        <h1>Insurance Companies</h1>
        <span>
          Submission channels, escalation matrix and operational TAT visibility.
        </span>
      </div>
      <DataTable
        title="Payer directory"
        rows={rows}
        columns={columns}
        getRowId={(row) => row._id}
        actions={
          <Button type="button" onClick={openCreate}>
            New payer
          </Button>
        }
        expandedRow={(row) => (
          <div className="form-grid-3">
            <div>
              <p className="eyebrow">Portal</p>
              <strong>{row.portalUrl ?? "Not configured"}</strong>
            </div>
            <div>
              <p className="eyebrow">Courier</p>
              <strong>{row.courierAddress ?? "Not configured"}</strong>
            </div>
            <div>
              <p className="eyebrow">Escalations</p>
              <strong>{row.escalationMatrix.length} contacts</strong>
            </div>
          </div>
        )}
      />
      <Modal
        open={modalOpen}
        title={editing ? "Update payer" : "Create payer"}
        onClose={closeModal}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div className="modal-body form-grid-2">
            <Field label="Company name">
              <TextInput
                required
                minLength={3}
                value={draft.name}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, name: e.target.value }))
                }
              />
            </Field>
            <Field label="TAT days">
              <TextInput
                type="number"
                min={0}
                value={draft.tatDays}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, tatDays: Number(e.target.value) }))
                }
              />
            </Field>
            <div className="field">
              <span>Submission methods</span>
              <div className="chip-cloud">
                {methods.map((method) => (
                  <label key={method} className="filter-chip">
                    <input
                      type="checkbox"
                      checked={draft.submissionMethods.includes(method)}
                      onChange={() => toggleMethod(method)}
                    />{" "}
                    {method}
                  </label>
                ))}
              </div>
            </div>
            <Field label="Email channel">
              <TextInput
                type="email"
                value={draft.email}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, email: e.target.value }))
                }
              />
            </Field>
            <Field label="Portal URL">
              <TextInput
                type="url"
                value={draft.portalUrl}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, portalUrl: e.target.value }))
                }
              />
            </Field>
            <Field label="Portal username">
              <TextInput
                value={draft.portalUsername}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, portalUsername: e.target.value }))
                }
              />
            </Field>
            <Field label="Portal password">
              <TextInput
                type="password"
                value={draft.portalPassword}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, portalPassword: e.target.value }))
                }
              />
            </Field>
            <Field label="Courier address">
              <TextArea
                value={draft.courierAddress}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, courierAddress: e.target.value }))
                }
              />
            </Field>
            <Field label="Primary contact name">
              <TextInput
                value={draft.contactName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, contactName: e.target.value }))
                }
              />
            </Field>
            <Field label="Primary contact email">
              <TextInput
                type="email"
                value={draft.contactEmail}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, contactEmail: e.target.value }))
                }
              />
            </Field>
            <Field label="Primary contact phone">
              <TextInput
                value={draft.contactPhone}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, contactPhone: e.target.value }))
                }
              />
            </Field>
            <Field label="Remarks">
              <TextArea
                value={draft.remarks}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, remarks: e.target.value }))
                }
              />
            </Field>
            <label className="field">
              <span>Active</span>
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, isActive: e.target.checked }))
                }
              />
            </label>
          </div>
          <div className="modal-footer">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save payer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
