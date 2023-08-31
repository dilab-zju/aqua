// import { combineReducers } from 'redux'
import mtData from './mtData'
import ftData from './ftData'
import opData from './opData'
import opDetail from './opDetail'
import opRecord from './opRecord'
import dbTable from './dbTable'

// const todoApp = combineReducers({
//   todos,
//   visibilityFilter
// })
export default function storeApp(state = {}, action) {
    return {
      mtData: mtData(state.mtData, action),
      ftData: ftData(state.ftData, action),
      opData: opData(state.opData, action),
      opDetail: opDetail(state.opDetail, action),
      opRecord: opRecord(state.opRecord, action),
      dbTable: dbTable(state.dbTable, action)
    }
}