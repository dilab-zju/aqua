
// const data = {
//     "name": "root",
//     "score": 1.28,
//     "children":[
//         {
//             "name": "node1",
//             "score": 1.12
//         },
//         {
//             "name": "node2",
//             "score": 1.08,
//             "children":[
//                 {
//                     "name": "node3",
//                     "score": 0.89
//                 },
//                 {
//                     "name": "node4",
//                     "score": 0.75
//                 }
//             ]
//         }
//     ]
// }

const opData = (state = [{},{},{}], action) => {
    switch (action.type) {
      case 'SET_OP_DATA':
        state[action.data["key"]] = action.data["opData"]
        return state
      default:
        return state
    }
  }
  
export default opData