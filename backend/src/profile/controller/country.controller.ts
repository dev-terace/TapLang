import { userService } from "../../users/services/user.service"
import { countryService } from "../service/country.service"
import { Request, Response } from 'express'

export async function updateCountryFlag(req: Request, res: Response) {
  try {
    const { flag } = req.params

    if (!flag) {
      return res.status(400).json({
        message: 'flag is required',
      })
    }

    const ownId = await userService.findUserIdByAuthToken(req)

    const profile = await countryService.updateCountryFlag(ownId, flag)

    return res.status(200).json(profile)
  } catch (error) {
    console.error('Failed to update country flag:', error)

    return res.status(500).json({
      message: 'Failed to update country flag',
    })
  }
}