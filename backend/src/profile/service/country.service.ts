import { postgresPrisma } from "../../lib/prisma";

export async function updateCountryFlag(
  ownId: number,
  flag: string,
) {
  return postgresPrisma.myProfile.update({
    where: {
      id: ownId,
    },
    data: {
      flag,
    },
  })
}

export const countryService = {
  updateCountryFlag
}