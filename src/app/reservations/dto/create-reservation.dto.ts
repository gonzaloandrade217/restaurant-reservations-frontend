export interface CreateReservationDto {
  date: string;
  partySize: number;
  userId: string;
  restaurantId: string;
  tableId?: string;
}