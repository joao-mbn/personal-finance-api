export interface GoogleTokensResponse {
  access_token: string;
  expires_in: Number;
  refresh_token: string;
  scope: string;
  id_token: string;
}

export type DateRange = {
  from: Date;
  to: Date;
};

export type DateRangeRequest = {
  from: string;
  to: string;
};
