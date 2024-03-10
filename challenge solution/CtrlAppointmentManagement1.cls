public with sharing class CtrlAppointmentManagement1 {
	@AuraEnabled // we need this line to make it available for lwc
  public static PetAppointment__c[] getAppointments(Date selectedDate){
		// method body here
		PetAppointment__c[] appointments = [SELECT Id,
      AppointmentCode__c,
      ContactName__c, Time__c, PetName__c, 
      Services__c, TimeSlot__c
      FROM PetAppointment__c
      WHERE Date__c =:selectedDate
      Order By Time__c
    ];
    return appointments;
	}
}