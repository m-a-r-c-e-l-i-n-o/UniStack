let nextTodoId = 0

export const addTodoOptimistic = (text) => {
  return {
        type: 'ADD_TODO',
        id: nextTodoId++,
        text
    }
}
