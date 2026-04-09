export type Status = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';

export type Job = {
  id:           number;
  title:        string;
  location:     string;
  status:       Status;
  date:         string;       // YYYY-MM-DD
  customerId:   number;
  customerName: string;
  time?:        string;
  duration?:    number;
  notes?:       string;
  instructions?: string;
  photos?:      string[];
  assignee?:    string;
  phone?:       string;
  customerPhone?: string;
  customerEmail?: string;
  latitude?:    number;
  longitude?:   number;
  priority?:    string;
  type?:        string;
};

export interface Customer {
  id:          number;
  name:        string;
  contact:     string;
  phone:       string;
  email:       string;
  address:     string;
  type:        string;
  active_jobs: number;
}

export type Screen = 'home' | 'detail';