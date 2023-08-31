// const testDetails = 
//   "\n \
//   Techniques:\n \
//   \tNone\n \
//   Score Detail:\n \
//   \t# of tables: \n \
//   \t# of joins: \n \
//   \t# of index: \n \
//   \tcardinality cost: "
const opDetail = (state = "", action) => {
    switch (action.type) {
      case 'SET_OP_DETAIL':
        return action.detail
      default:
        return state
    }
  }
  
export default opDetail