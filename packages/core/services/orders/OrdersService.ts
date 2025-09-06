export interface MediaOrderDTO {
  id: string
  escortId: string
  clientId: string
  status: 'PENDING'|'ACCEPTED'|'REJECTED'|'DELIVERED'
  request: any
  price: number
}

export interface OrdersService {
  listMyOrders(escortId: string): Promise<MediaOrderDTO[]>
  accept(orderId: string): Promise<void>
  reject(orderId: string): Promise<void>
  deliver(orderId: string, file: File): Promise<void>
}

// Stub par défaut (mock) pour le squelette
export const ordersService: OrdersService = {
  async listMyOrders() {
    return []
  },
  async accept() {},
  async reject() {},
  async deliver() {},
}

