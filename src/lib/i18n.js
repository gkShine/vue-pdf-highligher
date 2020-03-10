export default {
  message: {
    'hint-message': 'Click and Drag',
    delete: 'DELETE',
    save: 'SAVE',
    cancel: 'CANCEL',
    add: 'NEW',
    placeholder: 'Add a Comment...'
  },
  t: function (key, value) {
    const { message } = this
    if (value === undefined) {
      return message[key]
    }
    message[key] = value
  },
  set: function (message = {}) {
    Object.assign(this.message, message)
  }
}
