import { LightningElement, track } from 'lwc'
import getAppointments from '@salesforce/apex/CtrlAppointmentManagement.getAppointments'

export default class AppointmentManagementGroup1 extends LightningElement {
  /**
   * @param array to store the data from salesforce
   * @description  we use track to rerender the html when we do changes
   */
  @track data
  showResults = false // boolean to check if we have data or not
  selectedDate // variable to store the date from input
  columns = [
    { label: 'Code', fieldName: 'recordUrl',  editable: false, type: 'text', initialWidth: 140},
    { label: 'Time', fieldName: 'Time__c', editable: false, type: 'text', initialWidth: 140 },
    { label: 'Pet Name', fieldName: 'PetName__c', editable: false, type: 'text', initialWidth: 160 },
    { label: 'Contact Name', fieldName: 'ContactName__c', editable: false, type: 'text', initialWidth: 160 },
    { label: 'Services', fieldName: 'Services__c', editable: false, type: 'text' },
  ]
  

  // every lwc component 
  async connectedCallback () {
    await this.searchAppointment()
  }

  // handler method of the search button
  handleChange (e) {
    console.log(e.detail.value)
    this.selectedDate = e.detail.value
  }

  async searchAppointment () {
    // we have an apex class that gets us all the appointments
    const data = await getAppointments({ selectedDate: this.selectedDate })
    // complete the code to store the appointments 
  }
}
