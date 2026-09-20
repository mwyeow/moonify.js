export class MoonifyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoonifyError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MoonifyApiError extends MoonifyError {
  public status: number;
  public service: "lastfm" | "spotify";

  constructor(service: "lastfm" | "spotify", status: number, message: string) {
    super(`${service} api error (${status}): ${message}`);
    this.name = "MoonifyApiError";
    this.service = service;
    this.status = status;
  }
}

export class MoonifyAuthError extends MoonifyError {
  constructor(service: "lastfm" | "spotify", message: string) {
    super(`could not authenticate with ${service}: ${message}`);
    this.name = "MoonifyAuthError";
  }
}
