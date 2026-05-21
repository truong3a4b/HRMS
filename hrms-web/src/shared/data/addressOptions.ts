import rawAddressData from "./danhmucxaphuong.json";

export type LookupOption = {
  id: string;
  name: string;
};

type RawWard = {
  maphuongxa: number | string;
  tenphuongxa: string;
};

type RawProvince = {
  matinhBNV: number | string;
  matinhTMS?: number | string;
  tentinhmoi: string;
  phuongxa: RawWard[];
};

const addressData = rawAddressData as RawProvince[];

export const provinceOptions: LookupOption[] = addressData.map((province) => ({
  id: String(province.matinhBNV),
  name: province.tentinhmoi,
}));

export const getWardOptions = (provinceId?: string | null): LookupOption[] => {
  if (!provinceId) {
    return [];
  }

  const province = addressData.find(
    (item) => String(item.matinhBNV) === provinceId,
  );

  return (
    province?.phuongxa.map((ward) => ({
      id: String(ward.maphuongxa),
      name: ward.tenphuongxa,
    })) ?? []
  );
};

export const getLookupId = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return "";
  }

  const record = value as { id?: unknown };
  return typeof record.id === "string" || typeof record.id === "number"
    ? String(record.id)
    : "";
};

export const findProvince = (id: string) =>
  provinceOptions.find((province) => province.id === id) ?? null;

export const findWard = (provinceId: string, wardId: string) =>
  getWardOptions(provinceId).find((ward) => ward.id === wardId) ?? null;
