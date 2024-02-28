import { LightningElement, api, wire, track } from 'lwc'
import { createRecord } from 'lightning/uiRecordApi' 
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import getAvailableTimeSlots from '@salesforce/apex/CtrlAppointmentManagement.getAvailableTimeSlots'
import getAllContacts from '@salesforce/apex/CtrlAppointmentManagement.getAllContacts'
import getPetsForContact from '@salesforce/apex/CtrlAppointmentManagement.getPetsForContact'
import getOppsForAccount from '@salesforce/apex/CtrlAppointmentManagement.getOppsForAccount'
import getAllServices from '@salesforce/apex/CtrlAppointmentManagement.getAllServices'

export default class NewAppointmentForm extends LightningElement {
  @api selectedDate
  @track appointment = { TimeSlot__c: '', Contact__c: '', Pet__c: '', ServicesCodes__c: '', Opportunity__c: '' }
  noSlotsAvailable = false
  spinner = false

  timeSlots = []
  contacts = []
  pets = []
  services = []
  opportunities = []

  get noContactSelected () { return !this.appointment.Contact__c }

  _saveAppointment
  @api get saveAppointment () { return this._savePokemon }
  set saveAppointment (v) { 
    this._saveAppointment = v
    if (this._saveAppointment) this.handleSave()
  }

  async connectedCallback () {
    try {
      const timeSlots = await getAvailableTimeSlots({ selectedDate: this.selectedDate })
      if (!timeSlots.length) {
        this.noSlotsAvailable = true
      }
      this.timeSlots = timeSlots.map(el => ({
        label: el.TimeSnapshot__c,
        value: el.Id
      }))
      const contacts = await getAllContacts()
      this.contacts = contacts.map(el => ({
        label: el.LastName + ' ' + el.FirstName,
        value: el.Id,
        acc: el.AccountId
      }))
      const services = await getAllServices()
      this.services = services.map(el => ({
        label: el.Name,
        value: el.Id,
        price: el.Price__c
      }))
    } catch (err) {
      console.error(err)
    }
  }

  close (name) {
    const evt = new CustomEvent('closeform', {
      detail: { name: name }
    })
    this.dispatchEvent(evt)
  }

  async handleChange (e) {
    console.log(e.detail.value)
    this.appointment[e.target.name] = e.detail.value
    console.log(JSON.stringify(this.appointment))
    await this.configOptions()
  }

  async configOptions () {
    if (this.appointment.Contact__c) {
      const pets = await getPetsForContact({ contactId: this.appointment.Contact__c })
      this.pets = pets.map(el => ({
        label: el.Name,
        value: el.Id
      }))

      const acc = this.contacts.find(el => el.value === this.appointment.Contact__c).acc
      const opportunities = await getOppsForAccount({ accountId: acc })
      this.opportunities = opportunities.map(el => ({
        label: el.Name,
        value: el.Id
      }))
    }
  }

  validateInput () {
    const comboboxes = Array.from(this.template.querySelectorAll('lightning-combobox'))
    const inputs = comboboxes.concat(Array.from(this.template.querySelectorAll('c-lwc-combobox')))
    
    return inputs.reduce((validSoFar, inputField) => {
      const result = inputField.checkValidity()
      inputField.reportValidity()
      return validSoFar && result
    }, true)
  }

  getServicesNames (servicesCodesStr) {
    if (!servicesCodesStr) return ''
    const servicesCodes = servicesCodesStr?.split(';') ?? []
    const names = servicesCodes.map(code => {
      const name = this.services.find(el => el.value === code).label
      return name
    })
    console.log(JSON.stringify(names))
    return names.join(', ')
  }

  async handleSave (){
    console.log(this.validateInput())
    if (!this.validateInput()) return
    try {
      const services = this.getServicesNames(this.appointment.ServicesCodes__c)
      const fields = {...this.appointment, Date__c: this.selectedDate, Services__c: services }
      this.spinner = true
      const recordInput = { apiName: 'PetAppointment__c', fields }
      await createRecord(recordInput)
      console.log(JSON.stringify(recordInput))
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Success",
          message: "Record created!",
          variant: "success",
        }),
      )
      this.spinner = false
      this.close('save')
    } catch (err) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error",
          message: "An error has occurred during record create.",
          variant: "error",
        }),
      )
      console.error(err)
      this.spinner = false
      this.close('error')
    }
  }
}