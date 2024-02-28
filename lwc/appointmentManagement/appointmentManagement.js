import { LightningElement, track } from 'lwc'
import newAppointment from 'c/newAppointmentModal'
import getAvailableTimeSlots from '@salesforce/apex/CtrlAppointmentManagement.getAvailableTimeSlots'
import getAppointments from '@salesforce/apex/CtrlAppointmentManagement.getAppointments'
import u from 'c/lwcUtils'

export default class AppointmentManagement extends LightningElement {
  spinner
  showResults = false
  selectedDate
  title = 'Search Appointments'
  @track data
  columns = [
    { label: 'Code', fieldName: 'recordUrl',  editable: false, type: 'url', typeAttributes: {label: { fieldName: 'AppointmentCode__c' }, target: '_blank'}, initialWidth: 140},
    { label: 'Time', fieldName: 'Time__c', editable: false, type: 'text', initialWidth: 140 },
    { label: 'Pet Name', fieldName: 'PetName__c', editable: false, type: 'text', initialWidth: 160 },
    { label: 'Contact Name', fieldName: 'ContactName__c', editable: false, type: 'text', initialWidth: 160 },
    { label: 'Services', fieldName: 'Services__c', editable: false, type: 'text' },
  ]

  get disableAddNew () { return !this.selectedDate }

  async connectedCallback () {
    const today = new Date(Date.now())
    const yyyy = today.getFullYear()
    const month = String(today.getMonth()+1)
    const mm = month.padStart(2,'0')
    const date = String(today.getDate())
    const dd = date.padStart(2,'0')

    console.log(today.getFullYear(),yyyy)
    console.log(today.getMonth(),mm)
    console.log(today.getDate(),dd)

    this.selectedDate = `${yyyy}-${mm}-${dd}`
    console.log(this.selectedDate)
    await this.searchAppointment()
  }

  handleChange (e) {
    console.log(e.detail.value)
    this.selectedDate = e.detail.value
  }

  async searchAppointment () {
    this.spinner = true
    const data = await getAppointments({ selectedDate: this.selectedDate })
    this.data = data.map(rec => ({ ...rec, recordUrl: `https://pawstails-dev-ed.develop.lightning.force.com/lightning/r/${rec.Id}/view` }))
    this.showResults = this.data.length
    this.spinner = false
  }

  async createNewAppointment () {
    const result = await newAppointment.open({
      label: 'Modal',
      size: 'small',
      header: 'Add New Appointment',
      selectedDate: this.selectedDate,
      onselect: (e) => {
        e.stopPropagation()
      },
      description: 'Modal to add a New Appointment'})
    console.log('👾 Modal close mode: ', result)
    if (result === 'save') {
      await this.searchAppointment()
    }
  }
}