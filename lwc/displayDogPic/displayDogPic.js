import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getDogPicture from '@salesforce/apex/DogPictureCallout.getDogPicture'

export default class DisplayDogPic extends LightningElement {
  @api recordId
  petName
  petBreed
  petImgUrl
  title
  spinner = false


  @wire(getRecord, { recordId: '$recordId', fields: ['Pet__c.Name', 'Pet__c.Breed__c'] })
  getDogInfo({data, error}){
    if (error) console.error(error)
    else if (data) {
      // this.petName = data.fields.Name.value
      this.petName = getFieldValue(data, 'Pet__c.Name')
      this.petBreed = getFieldValue(data, 'Pet__c.Breed__c')
      this.fetchData()
      this.title = `🐶Dog Api: ${this.petBreed}`
    }
  }

  async fetchData () {
    this.spinner = true
    const breed = this.petBreed.toLowerCase().split(' ').join('/')
    const resp = await getDogPicture({ breed: breed })
    if (resp.statusCode === 404) console.error('Could not fetch data')
    else {
      this.petImgUrl = resp.message
      this.init = true
    }
    this.spinner = false
  }
}