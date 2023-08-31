const tmpData = [{key: '1', table_name: 'CIFAR'},{key: '2', table_name: 'CIFAR_feature'}]

const dbTable = (state = tmpData, action) => {
    switch (action.type) {
      case 'ADD_DB_TABLE':
        return [
          ...state,
          {
            key: action.entry['key'],
            table_name: action.entry['table_name'], 
          }
        ]
      default:
        return state
    }
  }
  
export default dbTable