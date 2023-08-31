// const tmpData = [{key: '1', name: 'CNN3', num_layer:17, description: 'a simple CNN...'}]

const mtData = (state = [], action) => {
    switch (action.type) {
      case 'ADD_MT_ENTRY':
        return [
          ...state,
          {
            key: action.entry['key'],
            name: action.entry['name'], 
            num_layer: action.entry['num_layer'],
            description: action.entry['description']
          }
        ]
      default:
        return state
    }
  }
  
export default mtData