import type { CategoriaValue, EstadoValue, RolValue, UrgenciaValue } from "./constants";

// Tipos que reflejan las tablas de la base de datos (public schema).

export interface Profile {
  id: string;
  full_name: string | null;
  role: RolValue;
  created_at: string;
}

export interface HelpRequest {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  category: CategoriaValue;
  urgency: UrgenciaValue;
  status: EstadoValue;
  lat: number | null;
  lng: number | null;
  location_text: string | null;
  contact_phone: string | null;
  people_count: number | null;
  created_at: string;
  updated_at: string;
}

// Solicitud con datos del autor incrustados (join con profiles).
export interface HelpRequestWithAuthor extends HelpRequest {
  author: Pick<Profile, "id" | "full_name"> | null;
}

export interface Offer {
  id: string;
  request_id: string;
  volunteer_id: string;
  message: string | null;
  status: "pendiente" | "aceptada" | "rechazada" | "completada";
  created_at: string;
}

export interface OfferWithRelations extends Offer {
  volunteer: Pick<Profile, "id" | "full_name"> | null;
  request: HelpRequest | null;
}

export interface Message {
  id: string;
  offer_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

// Publicación de un voluntario: qué puede ofrecer y dónde.
export interface VolunteerListing {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  category: CategoriaValue;
  location_text: string | null;
  lat: number | null;
  lng: number | null;
  contact_phone: string | null;
  status: "activo" | "pausado";
  created_at: string;
  updated_at: string;
}

export interface VolunteerListingWithAuthor extends VolunteerListing {
  author: Pick<Profile, "id" | "full_name"> | null;
}
