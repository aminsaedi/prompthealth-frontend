import { Professional } from "./professional";
import { Profile } from "./profile";
import { IUserDetail } from "./user-detail";

export interface IBooking {
  bookingDateTime?: string | Date;
  createdAt?: string | Date;
  customerId?: IUserDetail,
  drId?: IUserDetail,
  email?: string;
  name?: string;
  note?: string;
  phone?: string;
  status?: number;
  isUrgent?: boolean;

  provider?: Professional;

  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  patientNote?: string;
  patientProfileImage?: string;
}

export class Booking implements IBooking {
  
  get bookingDateTime():Date { return new Date(this.data.bookingDateTime); }

  get provider(): Professional { return this._provider; }
  
  get patientName() { return this.data.name; }
  get patientEmail() { return this.data.email; }
  get patientPhone() { return this.data.phone; }
  get patientNote() { return this.data.note; }
  get patientProfileImage() { return this._client.profileImage; }
  
  get note() { return this.data.note; }
  get isUrgent() { return this.data.isUrgent || false; }

  get createdAt(): Date { return new Date(this.data.createdAt); }

  _provider: Professional;
  _client: Profile;
  constructor(private data: IBooking) {
    this._provider = new Professional(data.drId._id, data.drId);
    this._client = new Profile(data.customerId);
  }
}