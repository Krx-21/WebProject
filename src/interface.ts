export interface RcpItem {
    _id: string;
    name: string;
    address: string;
    district: string;
    province: string;
    postalcode: string;
    tel: string;
    picture: string;
    dailyrate: number;
    __v: number;
    id: string;
}

export interface RcpJson {
    success: boolean;
    count: number;
    pagination: Object;
    data: RcpItem[];
} 