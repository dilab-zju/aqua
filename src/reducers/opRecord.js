// const testRecord = [
//     {"key":1, "date":"2022-12-20", "nUDF":"detect", "rule":"Pre-join", "score":12}
// ]

const opRecord = (state = [], action) => {
    switch (action.type) {
      case 'ADD_OP_RECORD':
        return [
          ...state,
          {
            key: action.entry['key'],
            date: action.entry['date'], 
            nUDF: action.entry['nUDF'],
            rule: action.entry['rule'],
            score: action.entry['score'],
            size: action.entry['size'],
            o_size: action.entry['o_size']
          }
        ]
      default:
        return state
    }
  }
  
export default opRecord