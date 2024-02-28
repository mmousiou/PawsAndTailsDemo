export default {
  groupBy (arr, fn) {
    return arr.reduce((res, k) => {
      const key = fn(k)
      if (!res[key]) res[key] = []
      res[key].push(k)
      return res
    }, {})
  },

  keyBy: (arr, fn) => arr.reduce((res, k) => ({ ...res, [fn(k)]: k }), {}), 
  
  sleep (ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }
}