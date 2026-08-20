export type AiDoctor = {
  id: string
  name: string
  specialty: string
  hospital: string
  fee: number
}

export const doctors: AiDoctor[] = [
  { id: 'doc1', name: 'Dr. Jean Mugabo', specialty: 'Cardiologist', hospital: 'Kigali University Hospital', fee: 25000 },
  { id: 'doc2', name: 'Dr. Marie Uwase', specialty: 'Pediatrician', hospital: "Rwanda Children's Hospital", fee: 20000 },
  { id: 'doc3', name: 'Dr. Eric Ndayishimiye', specialty: 'Neurologist', hospital: 'CHUK', fee: 30000 },
  { id: 'doc4', name: 'Dr. Claire Mutesi', specialty: 'Dental', hospital: 'Gakwerere Dental Clinic', fee: 18000 },
  { id: 'doc5', name: 'Dr. Patrick Habimana', specialty: 'General practitioner', hospital: 'Ubuzima Bwiza Network', fee: 15000 },
  { id: 'doc6', name: 'Dr. Grace Ingabire', specialty: 'Gynecologist', hospital: 'King Faisal Hospital', fee: 28000 },
]
