public with sharing class CtrlAppointmentManagement1 {
	@AuraEnabled // we need this line to make it available for lwc
  public static PetAppointment__c[] getAppointments(Date selectedDate){
		// method body here
	}
}