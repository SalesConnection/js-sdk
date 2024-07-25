import axios, { AxiosRequestConfig } from 'axios';
import moment, { Moment } from 'moment';
import 'moment-timezone';

interface Filter {
    default_fields?: { lbl_id: string, operator: string, value: any }[];
    dynamic_fields?: { lbl_id: string, operator: string, value: any }[];
    ref_id        ?: any;
    name          ?: any;
    source_type   ?: TemplateType;
    source_id     ?: any;
    seq_no        ?: string;
}

export type DataTemplate = {
    type           : string,
    category      ?: string,
    default_fields : Field[],
    dynamic_fields : Field[],
    assetMappingCode ?: string,
};

export type WithCustomerDataTemplate = DataTemplate & {
    customer_id ?: string,
};

export type DataLevel = DataTemplate & {
    id    : string,
    seq_no: string,
};

export type UpdateLog = {
    datetime: string,
}

export type DataRef = {
    ref_id: string,
    type  : number | string,
}

export type DataRefLevel = DataTemplate & DataRef & {
    seq_no : string,
};

export type Field<T=any> = {
    lbl_id: string,
    label : string,
    type  : string,
    value : string|T[],
};

export type BaseData = {
    id : string,
    name : string,
};

export type BaseAsset = BaseData & {};

export type BaseProduct = BaseData & {
    added     : number,
    quantity  : number,
    unit_price: number,
    notes     : string,
};

export type Response<T = any> = {
    data  : T,
    error?: any[],
}

export type PaginatedResponse<T = any> = Response<T> & {
    current_page: number,
    per_page    : number,
    last_page   : number,
    total       : number,
};

export type SearchOptions = {
    category?: string,
    filter  ?: Filter,
}

export type AssetFilterOptions = {
    type  ?: TemplateType,
    ref_id?: string,
    filter?: Filter,
    page  ?: number,
    assetMappingCode ?: string,
}

export type UserPermissions = {
    assign ?: any;
    view ?: any,
    id ?: string,
    displayname  ?: string,
}

export enum TemplateType {
    Customer = 1,
    Deal     = 2,
    Job      = 3,
    Asset    = 4,
    Product  = 5,
    DF01     = 6,
    DF02     = 7,
    DF03     = 8,
    DF04     = 9,
    DF05     = 10,
    DF06     = 11,
    DF07     = 12,
};

export default class SalesConnection {
    private readonly baseUrl  : string;
    private readonly apiKey   : string;
    private readonly apiSecret: string;

    constructor(baseUrl: string, apiKey: string, apiSecret: string) {
        this.baseUrl   = baseUrl;
        this.apiKey    = apiKey;
        this.apiSecret = apiSecret;
    }

    async getCategory<T = string[]>(type: TemplateType): Promise<Response<T>|never> {
        try {
            return await this.call<T>('/category', {
                method: 'GET',
                params: {
                    type,
                }
            });
        } catch (error) {
            console.error(`Error fetching category for type ${type}:`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    async getStatus<T = string[]>(type: TemplateType, category: string): Promise<Response<T>|never> {
        try {
            return await this.call<T>('/status', {
                method: 'GET',
                params: {
                    type,
                    category,
                }
            });
        } catch (error) {
            console.error(`Error fetching status for type ${type}:`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    async getTemplate(type: TemplateType, category: string): Promise<Response<DataTemplate>|never> {
        try {
            return await this.call<DataTemplate>('/template', {
                params: {
                    type,
                    category,
                }
            });
        } catch (error) {
            console.error(`Error fetching template for type ${type} and category ${category}:`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    async getAssets<T = BaseAsset[]>(option?: AssetFilterOptions): Promise<PaginatedResponse<T>|never> {
        let params: any = option;
        if (option?.filter) {
            params.filter = JSON.stringify(option.filter);
        }
        return await this.call<T, PaginatedResponse<T>>('/asset', { params });
    }

    async getAssetCustomerMapping<T = BaseAsset[]>(option?: AssetFilterOptions): Promise<PaginatedResponse<T>|never> {
        let params: any = option;
        if (option?.filter) {
            params.filter = JSON.stringify(option.filter);
        }
        
        return await this.call<T, PaginatedResponse<T>>('/asset-mapping', { params });
    }

    async getProducts<T = BaseProduct[]>(): Promise<PaginatedResponse<T>|never> {
        return await this.call<T, PaginatedResponse<T>>('/product');
    }

    async search<T = DataLevel[]>(type: TemplateType, option?: SearchOptions): Promise<PaginatedResponse<T>|never> {
        let params: any = {
            type,
        };
        if (option?.filter) {
            params.filter = JSON.stringify(option.filter);
        }
        if (option?.category) {
            params.category = option.category;
        }
        return await this.call<T, PaginatedResponse<T>>('/search', {
            params,
        });
    }

    async createData<T = DataRef, R = Response<T>>(data: DataTemplate): Promise<R> {
        const url = `${this.baseUrl}/data/create`;
        try {
            return await this.call<T, R>('/data', {
                method: 'POST',
                data,
            });
        } catch (error) {
            console.error(`Error creation process`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    async updateData<T = DataRef, R = Response<T>>(type: TemplateType, data: DataRefLevel): Promise<R> {
        try {
            return await this.call<T, R>('/data', {
                method: 'PATCH',
                params: {
                    type,
                    ref_id : data.ref_id,
                },
                data,
            });
        } catch (error) {
            console.error(`Error fetching detail`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    async updateStatus(type: TemplateType, ref_id: string, status: string, update_date?: Moment): Promise<boolean|never> {

        update_date = update_date ?? moment.tz('Asia/Kuala_Lumpur');

        try {
            await this.call('/data/status', {
                method: 'PATCH',
                params: {
                    type,
                    ref_id,
                    update_date : update_date.format('YYYY-MM-DD HH:mm:ss')
                },
                data: {
                    status,
                }
            });
            return true;
        } catch (error) {
            console.error(`Error update status process`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    // Need to check and correct this code -- JAY
    async statusLogData<T = UpdateLog>(type: TemplateType, ref_id: string, status: string): Promise<Response<T>|never> {
        try {
            return await this.call<T>('/data/status/log', {
                method: 'GET',
                params: {
                    type,
                    ref_id,
                    status, // Include status in params
                },
            });
        } catch (error) {
            console.error(`Error updating status process`, error);
            throw error; // Rethrow the error for handling at a higher level
        }
    }

    async getDetail<T = DataRefLevel>(type: TemplateType, ref_id: string): Promise<Response<T>|never> {
        try {
            return await this.call<T>('/data', {
                params: {
                    type,
                    ref_id,
                }
            });
        } catch (error) {
            console.error(`Error fetching detail`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    // to get user account permission based on profileid passed
    async getPermissions<T = UserPermissions>(type: TemplateType, ref_id: string): Promise<Response<T>|never> {
        try {
            return await this.call<T>('/data/permission', {
                method: 'GET',
                params: {
                    type,
                    ref_id,
                }
            });
        } catch (error) {
            console.error(`Error fetching permissions for ref_id ${ref_id}:`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    // to get user account permission based on profileid passed
    async getCustomerAssignedList<T = UserPermissions>(type: TemplateType, ref_id: string): Promise<Response<T>|never> {
        try {
            return await this.call<T>('/data/permission/customer', {
                method: 'GET',
                params: {
                    type,
                    ref_id,
                }
            });
        } catch (error) {
            console.error(`Error fetching permissions for ref_id ${ref_id}:`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    private async call<T = any, R = Response<T>>(path: string, options: AxiosRequestConfig = {}): Promise<R|never> {
        options.method  = options.method || 'GET';
        options.headers = {
            key    : this.apiKey,
            secret : this.apiSecret,
            ...options.headers
        }
        let resp = await axios(this.url(path), options);
        return resp.data as R;
    }

    private url(path: string): string {
        let url = this.baseUrl;
        if (!url.endsWith('/')) {
            url += '/';
        }
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        return `${url}${path}`;
    }
}

export class FieldHelper {
    public fields: Field[];

    constructor(fields: Field[]) {
        this.fields = fields;
    }

    setValue(lbl_id: string, value: any) {
        let field = this.fields.find(f => f.lbl_id == lbl_id);
        if (field) {
            field.value = value;
        }
        return this;
    }

    getValue(lbl_id: string) {
        let field = this.fields.find(f => f.lbl_id == lbl_id);
        return field?.value;
    }
}

export class CallbackHelper {
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    async success() {
        return await axios.post(this.url, { status: 2 });
    }

    async fail() {
        return await axios.post(this.url, { status: -1 });
    }
}
