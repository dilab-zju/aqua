const ftData = (state = [], action) => {
    switch (action.type) {
      case 'ADD_FT_ENTRY':
        return [
          ...state,
          {
            key: action.entry['key'],
            function: action.entry['function'], 
            model: action.entry['model']
          }
        ]
      default:
        return state
    }
  }
  
export default ftData