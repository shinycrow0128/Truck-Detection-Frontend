"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Camera, Truck } from "@/lib/supabase/types";

// ─── Truck form values ───────────────────────────────────────────────────────
type TruckFormValues = {
  truck_name: string;
  truck_number: string;
  truck_detail: string;
};

const emptyTruckForm: TruckFormValues = {
  truck_name: "",
  truck_number: "",
  truck_detail: "",
};

// ─── Camera form values ──────────────────────────────────────────────────────
type CameraFormValues = {
  camera_name: string;
  camera_info: string;
  camera_location: string;
  battery: string;
  data_used: string;
};

const emptyCameraForm: CameraFormValues = {
  camera_name: "",
  camera_info: "",
  camera_location: "",
  battery: "",
  data_used: "",
};

// ─── Modal ───────────────────────────────────────────────────────────────────
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-labelledby="modal-title"
    >
      <div
        className="w-full max-w-md rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 id="modal-title" className="text-lg font-semibold text-[var(--color-text)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Truck form ───────────────────────────────────────────────────────────────
function TruckForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  submitting,
}: {
  values: TruckFormValues;
  onChange: (v: TruckFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="truck_name" className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Truck Name
        </label>
        <input
          id="truck_name"
          type="text"
          value={values.truck_name}
          onChange={(e) => onChange({ ...values, truck_name: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="e.g. Fleet Truck A"
        />
      </div>
      <div>
        <label htmlFor="truck_number" className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Truck Number / License Plate
        </label>
        <input
          id="truck_number"
          type="text"
          value={values.truck_number}
          onChange={(e) => onChange({ ...values, truck_number: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="e.g. ABC-1234"
        />
      </div>
      <div>
        <label htmlFor="truck_detail" className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Truck Detail
        </label>
        <textarea
          id="truck_detail"
          rows={3}
          value={values.truck_detail}
          onChange={(e) => onChange({ ...values, truck_detail: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
          placeholder="Additional details about the truck"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

// ─── Camera form ──────────────────────────────────────────────────────────────
function CameraForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  submitting,
}: {
  values: CameraFormValues;
  onChange: (v: CameraFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="camera_name" className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Camera Name
        </label>
        <input
          id="camera_name"
          type="text"
          value={values.camera_name}
          onChange={(e) => onChange({ ...values, camera_name: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="e.g. Front Camera"
        />
      </div>
      <div>
        <label htmlFor="camera_info" className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Camera Info
        </label>
        <input
          id="camera_info"
          type="text"
          value={values.camera_info}
          onChange={(e) => onChange({ ...values, camera_info: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="e.g. Reolink RLC-510A"
        />
      </div>
      <div>
        <label htmlFor="camera_location" className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Camera Location
        </label>
        <input
          id="camera_location"
          type="text"
          value={values.camera_location}
          onChange={(e) => onChange({ ...values, camera_location: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="e.g. Warehouse Entrance"
        />
      </div>
      <div>
        <label htmlFor="battery" className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Battery (%)
        </label>
        <input
          id="battery"
          type="number"
          min={0}
          max={100}
          value={values.battery}
          onChange={(e) => onChange({ ...values, battery: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="e.g. 100"
        />
      </div>
      <div>
        <label htmlFor="data_used" className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Data Used
        </label>
        <input
          id="data_used"
          type="text"
          value={values.data_used}
          onChange={(e) => onChange({ ...values, data_used: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          placeholder="e.g. 2.5 GB"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{subtitle}</p>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ManageTruckCamera() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Truck modal
  const [truckModalOpen, setTruckModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [truckForm, setTruckForm] = useState<TruckFormValues>(emptyTruckForm);
  const [truckSubmitting, setTruckSubmitting] = useState(false);

  // Camera modal
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);
  const [cameraForm, setCameraForm] = useState<CameraFormValues>(emptyCameraForm);
  const [cameraSubmitting, setCameraSubmitting] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "truck" | "camera"; id: string; label: string } | null>(null);

  const fetchTrucks = useCallback(async () => {
    const supabase = createClient();
    const { data, error: e } = await supabase.from("truck").select("*").order("truck_name");
    if (e) throw e;
    setTrucks((data as Truck[]) ?? []);
  }, []);

  const fetchCameras = useCallback(async () => {
    const supabase = createClient();
    const { data, error: e } = await supabase.from("camera").select("*").order("camera_name");
    if (e) throw e;
    setCameras((data as Camera[]) ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchTrucks(), fetchCameras()]);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [fetchTrucks, fetchCameras]);

  // Truck handlers
  const openAddTruck = () => {
    setEditingTruck(null);
    setTruckForm(emptyTruckForm);
    setTruckModalOpen(true);
  };

  const openEditTruck = (t: Truck) => {
    setEditingTruck(t);
    setTruckForm({
      truck_name: t.truck_name ?? "",
      truck_number: t.truck_number ?? "",
      truck_detail: t.truck_detail ?? "",
    });
    setTruckModalOpen(true);
  };

  const saveTruck = async () => {
    setTruckSubmitting(true);
    try {
      const supabase = createClient();
      const payload = {
        truck_name: truckForm.truck_name || null,
        truck_number: truckForm.truck_number || null,
        truck_detail: truckForm.truck_detail || null,
        updated_at: new Date().toISOString(),
      };
      if (editingTruck) {
        const { error: e } = await supabase.from("truck").update(payload).eq("id", editingTruck.id);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from("truck").insert(payload);
        if (e) throw e;
      }
      await fetchTrucks();
      setTruckModalOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save truck");
    } finally {
      setTruckSubmitting(false);
    }
  };

  const removeTruck = async (id: string) => {
    try {
      const supabase = createClient();
      const { error: e } = await supabase.from("truck").delete().eq("id", id);
      if (e) throw e;
      await fetchTrucks();
      setDeleteConfirm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete truck");
    }
  };

  // Camera handlers
  const openAddCamera = () => {
    setEditingCamera(null);
    setCameraForm(emptyCameraForm);
    setCameraModalOpen(true);
  };

  const openEditCamera = (c: Camera) => {
    setEditingCamera(c);
    setCameraForm({
      camera_name: c.camera_name ?? "",
      camera_info: c.camera_info ?? "",
      camera_location: c.camera_location ?? "",
      battery: c.battery != null ? String(c.battery) : "",
      data_used: c.data_used ?? "",
    });
    setCameraModalOpen(true);
  };

  const saveCamera = async () => {
    setCameraSubmitting(true);
    try {
      const supabase = createClient();
      const batteryNum = cameraForm.battery ? parseInt(cameraForm.battery, 10) : null;
      const payload = {
        camera_name: cameraForm.camera_name || null,
        camera_info: cameraForm.camera_info || null,
        camera_location: cameraForm.camera_location || null,
        battery: isNaN(Number(batteryNum)) ? null : batteryNum,
        data_used: cameraForm.data_used || null,
        updated_at: new Date().toISOString(),
      };
      if (editingCamera) {
        const { error: e } = await supabase.from("camera").update(payload).eq("id", editingCamera.id);
        if (e) throw e;
      } else {
        const { error: e } = await supabase.from("camera").insert(payload);
        if (e) throw e;
      }
      await fetchCameras();
      setCameraModalOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save camera");
    } finally {
      setCameraSubmitting(false);
    }
  };

  const removeCamera = async (id: string) => {
    try {
      const supabase = createClient();
      const { error: e } = await supabase.from("camera").delete().eq("id", id);
      if (e) throw e;
      await fetchCameras();
      setDeleteConfirm(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete camera");
    }
  };

  const truckLabel = (t: Truck) => t.truck_name ?? t.truck_number ?? t.id.slice(0, 8);
  const cameraLabel = (c: Camera) => c.camera_name ?? c.camera_location ?? c.id.slice(0, 8);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <header className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] px-4 py-4 shadow-sm transition-colors duration-300">
          <div className="w-full flex flex-wrap items-center gap-4">
            <h1 className="text-lg font-semibold text-[var(--color-text)]">Manage Truck and Camera</h1>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
          <p className="text-[var(--color-text-secondary)]">Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <header className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] px-4 py-4 shadow-sm transition-colors duration-300">
        <div className="w-full flex flex-wrap items-center gap-2">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold text-[var(--color-text)]">Manage Truck and Camera</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Add, edit, and remove trucks and cameras.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-6">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Trucks */}
          <SectionCard
            title="Trucks"
            subtitle={`${trucks.length} truck(s)`}
            action={
              <button
                type="button"
                onClick={openAddTruck}
                className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)]"
              >
                Add Truck
              </button>
            }
          >
            {trucks.length === 0 ? (
              <p className="text-[var(--color-text-secondary)] text-sm">No trucks yet. Add one to get started.</p>
            ) : (
              <ul className="space-y-2">
                {trucks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--color-text)] truncate">{truckLabel(t)}</p>
                      {(t.truck_number || t.truck_detail) && (
                        <p className="text-sm text-[var(--color-text-secondary)] truncate">
                          {[t.truck_number, t.truck_detail].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditTruck(t)}
                        className="px-3 py-1.5 rounded-lg text-sm text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ type: "truck", id: t.id, label: truckLabel(t) })}
                        className="px-3 py-1.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Cameras */}
          <SectionCard
            title="Cameras"
            subtitle={`${cameras.length} camera(s)`}
            action={
              <button
                type="button"
                onClick={openAddCamera}
                className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-hover)]"
              >
                Add Camera
              </button>
            }
          >
            {cameras.length === 0 ? (
              <p className="text-[var(--color-text-secondary)] text-sm">No cameras yet. Add one to get started.</p>
            ) : (
              <ul className="space-y-2">
                {cameras.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border)]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[var(--color-text)] truncate">{cameraLabel(c)}</p>
                      {(c.camera_location || c.camera_info || c.battery != null) && (
                        <p className="text-sm text-[var(--color-text-secondary)] truncate">
                          {[c.camera_location, c.camera_info, c.battery != null ? `${c.battery}%` : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditCamera(c)}
                        className="px-3 py-1.5 rounded-lg text-sm text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm({ type: "camera", id: c.id, label: cameraLabel(c) })}
                        className="px-3 py-1.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      </main>
      {/* Truck modal */}
      <Modal
        open={truckModalOpen}
        onClose={() => setTruckModalOpen(false)}
        title={editingTruck ? "Edit Truck" : "Add Truck"}
      >
        <TruckForm
          values={truckForm}
          onChange={setTruckForm}
          onSubmit={saveTruck}
          onCancel={() => setTruckModalOpen(false)}
          submitting={truckSubmitting}
        />
      </Modal>

      {/* Camera modal */}
      <Modal
        open={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        title={editingCamera ? "Edit Camera" : "Add Camera"}
      >
        <CameraForm
          values={cameraForm}
          onChange={setCameraForm}
          onSubmit={saveCamera}
          onCancel={() => setCameraModalOpen(false)}
          submitting={cameraSubmitting}
        />
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title={`Remove ${deleteConfirm?.type === "truck" ? "Truck" : "Camera"}?`}
      >
        {deleteConfirm && (
          <div className="space-y-4">
            <p className="text-[var(--color-text-secondary)]">
              Are you sure you want to remove <strong className="text-[var(--color-text)]">{deleteConfirm.label}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-hover)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  deleteConfirm.type === "truck"
                    ? removeTruck(deleteConfirm.id)
                    : removeCamera(deleteConfirm.id)
                }
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
