export interface CreateReservationDto {
  date: string;
  time: string;
  partySize: number;
  userId: string;
  restaurantId: string;
  tableId?: string;
}