import { Edit3, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { accountApi } from "../../api/accountApi.js";
import { toArabicError } from "../../api/httpClient.js";
import Button from "../../components/Button.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const emptyAddress = {
  city: "",
  area: "",
  street: "",
  building: "",
  notes: "",
  isDefault: false,
};

function Field({ label, value, onChange }) {
  return (
    <label className="block text-sm font-bold text-ink">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-2xl bg-ivory px-4 text-sm text-ink outline-none focus:ring-4 focus:ring-shell/25"
      />
    </label>
  );
}

export default function AccountAddresses() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyAddress);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAddresses = async () => {
    setLoading(true);
    try {
      setAddresses(await accountApi.getAddresses());
      setError("");
    } catch (requestError) {
      setAddresses([]);
      setError(toArabicError(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const edit = (address) => {
    setEditingId(address.id);
    setForm(address);
  };

  const save = async () => {
    try {
      const payload = {
        city: form.city,
        area: form.area,
        street: form.street,
        building: form.building || null,
        notes: form.notes || null,
        isDefault: form.isDefault,
      };
      if (editingId) {
        await accountApi.updateAddress(editingId, payload);
      } else {
        await accountApi.createAddress(payload);
      }
      await loadAddresses();
      setEditingId(null);
      setForm(emptyAddress);
      showToast({ message: t("settingsUpdated") });
    } catch (requestError) {
      setError(toArabicError(requestError));
    }
  };

  const remove = async (id) => {
    await accountApi.deleteAddress(id);
    await loadAddresses();
  };

  const setDefault = async (id) => {
    await accountApi.setDefaultAddress(id);
    await loadAddresses();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-terracotta">
          {editingId ? t("editAddress") : t("addAddress")}
        </p>
        {error ? <p className="mt-4 rounded-2xl bg-sale/10 px-4 py-3 text-sm font-bold text-sale">{error}</p> : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label={t("city")} value={form.city} onChange={(value) => update("city", value)} />
          <Field label={t("area")} value={form.area} onChange={(value) => update("area", value)} />
          <Field label={t("street")} value={form.street} onChange={(value) => update("street", value)} />
          <Field label={t("building")} value={form.building} onChange={(value) => update("building", value)} />
          <Field label={t("notes")} value={form.notes} onChange={(value) => update("notes", value)} />
          <label className="flex items-center gap-3 rounded-2xl bg-ivory px-4 py-3 text-sm font-bold text-ink">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) => update("isDefault", event.target.checked)}
              className="h-4 w-4 rounded border-shell text-terracotta focus:ring-terracotta"
            />
            {t("defaultAddress")}
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <Button onClick={save}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t("save")}
          </Button>
          {editingId ? (
            <Button variant="outline" onClick={() => { setEditingId(null); setForm(emptyAddress); }}>
              {t("cancel")}
            </Button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4">
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="font-display text-3xl font-bold text-ink">{t("loading")}</h2>
          </div>
        ) : null}
        {!loading && addresses.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="font-display text-3xl font-bold text-ink">{t("addresses")}</h2>
            <p className="mt-2 text-sm text-muted">
              لا توجد بيانات
            </p>
          </div>
        ) : (
          addresses.map((address) => (
            <article key={address.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-ink">{address.city}, {address.area}</h3>
                    {address.isDefault ? <Star className="h-4 w-4 fill-terracotta text-terracotta" aria-hidden="true" /> : null}
                  </div>
                  <p className="mt-2 text-sm text-muted">{address.street}, {address.building}</p>
                  <p className="mt-1 text-sm text-muted">{address.notes}</p>
                </div>
                <div className="flex gap-2">
                  <button className="grid h-9 w-9 place-items-center rounded-full bg-ivory text-ink" onClick={() => edit(address)} aria-label={t("edit")}>
                    <Edit3 className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button className="grid h-9 w-9 place-items-center rounded-full bg-ivory text-muted" onClick={() => remove(address.id)} aria-label={t("delete")}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {!address.isDefault ? (
                    <Button size="sm" variant="outline" onClick={() => setDefault(address.id)}>
                      {t("setDefault")}
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
