import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Country } from '@/types'
import { CountryApi } from '../api/country.api'

export const useCountryStore = defineStore('country', () => {
const countries = ref<Country[]>([
  // 동아시아
  { code: 'KR', name: 'South Korea', flag: 'kr' },
  { code: 'US', name: 'United States', flag: 'us' },
  { code: 'JP', name: 'Japan', flag: 'jp' },
  { code: 'CN', name: 'China', flag: 'cn' },
  { code: 'TW', name: 'Taiwan', flag: 'tw' },
  { code: 'HK', name: 'Hong Kong', flag: 'hk' },
  { code: 'MO', name: 'Macao', flag: 'mo' },
  { code: 'MN', name: 'Mongolia', flag: 'mn' },

  // 유럽
  { code: 'GB', name: 'United Kingdom', flag: 'gb' },
  { code: 'FR', name: 'France', flag: 'fr' },
  { code: 'DE', name: 'Germany', flag: 'de' },
  { code: 'IT', name: 'Italy', flag: 'it' },
  { code: 'ES', name: 'Spain', flag: 'es' },
  { code: 'PT', name: 'Portugal', flag: 'pt' },
  { code: 'NL', name: 'Netherlands', flag: 'nl' },
  { code: 'BE', name: 'Belgium', flag: 'be' },
  { code: 'CH', name: 'Switzerland', flag: 'ch' },
  { code: 'AT', name: 'Austria', flag: 'at' },
  { code: 'SE', name: 'Sweden', flag: 'se' },
  { code: 'NO', name: 'Norway', flag: 'no' },
  { code: 'DK', name: 'Denmark', flag: 'dk' },
  { code: 'FI', name: 'Finland', flag: 'fi' },
  { code: 'IS', name: 'Iceland', flag: 'is' },
  { code: 'PL', name: 'Poland', flag: 'pl' },
  { code: 'CZ', name: 'Czech Republic', flag: 'cz' },
  { code: 'SK', name: 'Slovakia', flag: 'sk' },
  { code: 'HU', name: 'Hungary', flag: 'hu' },
  { code: 'RO', name: 'Romania', flag: 'ro' },
  { code: 'BG', name: 'Bulgaria', flag: 'bg' },
  { code: 'HR', name: 'Croatia', flag: 'hr' },
  { code: 'SI', name: 'Slovenia', flag: 'si' },
  { code: 'RS', name: 'Serbia', flag: 'rs' },
  { code: 'BA', name: 'Bosnia and Herzegovina', flag: 'ba' },
  { code: 'ME', name: 'Montenegro', flag: 'me' },
  { code: 'MK', name: 'North Macedonia', flag: 'mk' },
  { code: 'AL', name: 'Albania', flag: 'al' },
  { code: 'GR', name: 'Greece', flag: 'gr' },
  { code: 'IE', name: 'Ireland', flag: 'ie' },
  { code: 'LT', name: 'Lithuania', flag: 'lt' },
  { code: 'LV', name: 'Latvia', flag: 'lv' },
  { code: 'EE', name: 'Estonia', flag: 'ee' },
  { code: 'LU', name: 'Luxembourg', flag: 'lu' },
  { code: 'MT', name: 'Malta', flag: 'mt' },
  { code: 'CY', name: 'Cyprus', flag: 'cy' },
  { code: 'MC', name: 'Monaco', flag: 'mc' },
  { code: 'LI', name: 'Liechtenstein', flag: 'li' },
  { code: 'AD', name: 'Andorra', flag: 'ad' },
  { code: 'SM', name: 'San Marino', flag: 'sm' },
  { code: 'VA', name: 'Vatican City', flag: 'va' },
  { code: 'BY', name: 'Belarus', flag: 'by' },
  { code: 'MD', name: 'Moldova', flag: 'md' },
  { code: 'RU', name: 'Russia', flag: 'ru' },
  { code: 'UA', name: 'Ukraine', flag: 'ua' },

  // 북아메리카/중남미
  { code: 'CA', name: 'Canada', flag: 'ca' },
  { code: 'MX', name: 'Mexico', flag: 'mx' },
  { code: 'GT', name: 'Guatemala', flag: 'gt' },
  { code: 'BZ', name: 'Belize', flag: 'bz' },
  { code: 'HN', name: 'Honduras', flag: 'hn' },
  { code: 'SV', name: 'El Salvador', flag: 'sv' },
  { code: 'NI', name: 'Nicaragua', flag: 'ni' },
  { code: 'CR', name: 'Costa Rica', flag: 'cr' },
  { code: 'PA', name: 'Panama', flag: 'pa' },
  { code: 'CU', name: 'Cuba', flag: 'cu' },
  { code: 'DO', name: 'Dominican Republic', flag: 'do' },
  { code: 'JM', name: 'Jamaica', flag: 'jm' },
  { code: 'BS', name: 'Bahamas', flag: 'bs' },
  { code: 'TT', name: 'Trinidad and Tobago', flag: 'tt' },
  { code: 'PR', name: 'Puerto Rico', flag: 'pr' },
  { code: 'BR', name: 'Brazil', flag: 'br' },
  { code: 'AR', name: 'Argentina', flag: 'ar' },
  { code: 'CL', name: 'Chile', flag: 'cl' },
  { code: 'CO', name: 'Colombia', flag: 'co' },
  { code: 'PE', name: 'Peru', flag: 'pe' },
  { code: 'VE', name: 'Venezuela', flag: 've' },
  { code: 'EC', name: 'Ecuador', flag: 'ec' },
  { code: 'BO', name: 'Bolivia', flag: 'bo' },
  { code: 'PY', name: 'Paraguay', flag: 'py' },
  { code: 'UY', name: 'Uruguay', flag: 'uy' },

  // 오세아니아
  { code: 'AU', name: 'Australia', flag: 'au' },
  { code: 'NZ', name: 'New Zealand', flag: 'nz' },
  { code: 'FJ', name: 'Fiji', flag: 'fj' },
  { code: 'PG', name: 'Papua New Guinea', flag: 'pg' },
  { code: 'WS', name: 'Samoa', flag: 'ws' },
  { code: 'TO', name: 'Tonga', flag: 'to' },

  // 남아시아/동남아시아
  { code: 'IN', name: 'India', flag: 'in' },
  { code: 'PK', name: 'Pakistan', flag: 'pk' },
  { code: 'BD', name: 'Bangladesh', flag: 'bd' },
  { code: 'LK', name: 'Sri Lanka', flag: 'lk' },
  { code: 'NP', name: 'Nepal', flag: 'np' },
  { code: 'BT', name: 'Bhutan', flag: 'bt' },
  { code: 'MV', name: 'Maldives', flag: 'mv' },
  { code: 'ID', name: 'Indonesia', flag: 'id' },
  { code: 'TH', name: 'Thailand', flag: 'th' },
  { code: 'VN', name: 'Vietnam', flag: 'vn' },
  { code: 'PH', name: 'Philippines', flag: 'ph' },
  { code: 'MY', name: 'Malaysia', flag: 'my' },
  { code: 'SG', name: 'Singapore', flag: 'sg' },
  { code: 'MM', name: 'Myanmar', flag: 'mm' },
  { code: 'LA', name: 'Laos', flag: 'la' },
  { code: 'KH', name: 'Cambodia', flag: 'kh' },
  { code: 'BN', name: 'Brunei', flag: 'bn' },
  { code: 'TL', name: 'East Timor', flag: 'tl' },

  // 중앙아시아
  { code: 'KZ', name: 'Kazakhstan', flag: 'kz' },
  { code: 'UZ', name: 'Uzbekistan', flag: 'uz' },
  { code: 'KG', name: 'Kyrgyzstan', flag: 'kg' },
  { code: 'TJ', name: 'Tajikistan', flag: 'tj' },
  { code: 'TM', name: 'Turkmenistan', flag: 'tm' },

  // 중동
  { code: 'TR', name: 'Turkey', flag: 'tr' },
  { code: 'SA', name: 'Saudi Arabia', flag: 'sa' },
  { code: 'AE', name: 'United Arab Emirates', flag: 'ae' },
  { code: 'IL', name: 'Israel', flag: 'il' },
  { code: 'IQ', name: 'Iraq', flag: 'iq' },
  { code: 'IR', name: 'Iran', flag: 'ir' },
  { code: 'JO', name: 'Jordan', flag: 'jo' },
  { code: 'LB', name: 'Lebanon', flag: 'lb' },
  { code: 'SY', name: 'Syria', flag: 'sy' },
  { code: 'YE', name: 'Yemen', flag: 'ye' },
  { code: 'OM', name: 'Oman', flag: 'om' },
  { code: 'QA', name: 'Qatar', flag: 'qa' },
  { code: 'KW', name: 'Kuwait', flag: 'kw' },
  { code: 'BH', name: 'Bahrain', flag: 'bh' },
  { code: 'AF', name: 'Afghanistan', flag: 'af' },
  { code: 'GE', name: 'Georgia', flag: 'ge' },
  { code: 'AM', name: 'Armenia', flag: 'am' },
  { code: 'AZ', name: 'Azerbaijan', flag: 'az' },

  // 아프리카
  { code: 'EG', name: 'Egypt', flag: 'eg' },
  { code: 'ZA', name: 'South Africa', flag: 'za' },
  { code: 'NG', name: 'Nigeria', flag: 'ng' },
  { code: 'KE', name: 'Kenya', flag: 'ke' },
  { code: 'ET', name: 'Ethiopia', flag: 'et' },
  { code: 'GH', name: 'Ghana', flag: 'gh' },
  { code: 'TZ', name: 'Tanzania', flag: 'tz' },
  { code: 'UG', name: 'Uganda', flag: 'ug' },
  { code: 'DZ', name: 'Algeria', flag: 'dz' },
  { code: 'MA', name: 'Morocco', flag: 'ma' },
  { code: 'TN', name: 'Tunisia', flag: 'tn' },
  { code: 'LY', name: 'Libya', flag: 'ly' },
  { code: 'SD', name: 'Sudan', flag: 'sd' },
  { code: 'CI', name: 'Ivory Coast', flag: 'ci' },
  { code: 'SN', name: 'Senegal', flag: 'sn' },
  { code: 'CM', name: 'Cameroon', flag: 'cm' },
  { code: 'ZM', name: 'Zambia', flag: 'zm' },
  { code: 'ZW', name: 'Zimbabwe', flag: 'zw' },
  { code: 'MZ', name: 'Mozambique', flag: 'mz' },
  { code: 'AO', name: 'Angola', flag: 'ao' },
  { code: 'NA', name: 'Namibia', flag: 'na' },
  { code: 'BW', name: 'Botswana', flag: 'bw' },
  { code: 'RW', name: 'Rwanda', flag: 'rw' },
  { code: 'MG', name: 'Madagascar', flag: 'mg' },
  { code: 'MU', name: 'Mauritius', flag: 'mu' },

  { code: 'UNKNOWN', name: 'Other', flag: 'un' }
])
  
  const updateCountryFlag = CountryApi.updateCountryFlag

  const getByCode = computed(() => {
    return (code: string) =>
      countries.value.find(country => country.code === code)
  })

  return {
    countries,
    getByCode,
    updateCountryFlag
  }
})