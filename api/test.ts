import dayjs from 'dayjs'

const monthInitial = dayjs('2025-2','YYYY-M').startOf('month').toString()
const monthFinal = dayjs('2025-2','YYYY-M').endOf('month').toString()

console.log(monthFinal,monthInitial);
