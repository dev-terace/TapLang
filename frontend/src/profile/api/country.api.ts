import api from "@/shared/auth/api.config";
import axios from "axios";

export namespace CountryApi {
  export async function updateCountryFlag(flag: string) {
    return await api.patch(`/api/profile/country/${flag}`)
  }
}