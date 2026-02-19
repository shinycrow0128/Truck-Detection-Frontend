export type Camera = {
  id: string;
  camera_name: string | null;
  camera_info: string | null;
  camera_location: string | null;
  battery: number | null;
  data_used: string | null;
  created_at: string;
  updated_at: string;
};

export type Truck = {
  id: string;
  truck_name: string | null;
  truck_number: string | null;
  truck_detail: string | null;
  created_at: string;
  updated_at: string;
};

export type TruckDetection = {
  id: number;
  camera_id: string;
  truck_id: string;
  bin_status: string | null;
  truck_status: string | null;
  detected_at: string;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  camera?: Camera | null;
  truck?: Truck | null;
};
