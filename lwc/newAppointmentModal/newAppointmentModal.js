import { api } from 'lwc'
import LightningModal from 'lightning/modal'

export default class NewAppointmentModal extends LightningModal {
  @api selectedDate
  @api header
  appointment
  savePressed = false

  handleCancel (e) {
    this.savePressed = false
    this.close('cancel')
  }

  handleCloseForm (e) {
    console.log('event is called', JSON.stringify(e))
    const { name } = e.detail
    this.close(name)
  }

  async handleSave (e) {
    console.log('save pressed')
    this.savePressed = true
  }
}