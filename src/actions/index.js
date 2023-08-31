let mtEntryId = 0
let ftEntryId = 0
let opRecordId = 0
let dbRecordId = 3

export const addMTEntry = entry => {
  entry['key'] = (mtEntryId++).toString()
  return {
    type: 'ADD_MT_ENTRY',
    entry
  }
}

export const addFTEntry = entry => {
  entry['key'] = (ftEntryId++).toString()
  return {
    type: 'ADD_FT_ENTRY',
    entry
  }
}

export const setOPData = data => {
  return {
    type: 'SET_OP_DATA',
    data
  }
}

export const setOPDetail = detail => {
  return {
    type: 'SET_OP_DETAIL',
    detail
  }
}

export const addOPRecord = entry => {
  entry['key'] = (opRecordId++).toString()
  return {
    type: 'ADD_OP_RECORD',
    entry
  }
}

export const addDBTABLE = entry => {
  entry['key'] = (dbRecordId++).toString()
  return {
    type: 'ADD_DB_TABLE',
    entry
  }
}