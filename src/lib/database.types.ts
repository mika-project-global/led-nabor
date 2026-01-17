type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          customer_info: Json
          items: Json
          total: number
          delivery_method: Json
          payment_method: Json
          status: string
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          customer_info: Json
          items: Json
          total: number
          delivery_method: Json
          payment_method: Json
          status?: string
          created_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          customer_info?: Json
          items?: Json
          total?: number
          delivery_method?: Json
          payment_method?: Json
          status?: string
          created_at?: string
          user_id?: string | null
        }
      }
    }
  }
}