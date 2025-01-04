import dayjs from "dayjs"
import localeData from 'dayjs/plugin/localeData'
import ptBr from   'dayjs/locale/pt-br'

dayjs.extend(localeData)
dayjs.locale(ptBr)

export default dayjs
