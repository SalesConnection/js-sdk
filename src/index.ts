import axios, { AxiosRequestConfig } from 'axios';
import moment, { Moment } from 'moment';
import 'moment-timezone';

interface Filter {
    default_fields ?: { lbl_id: string, operator: SearchOperator, value: any }[];
    dynamic_fields ?: { lbl_id: string, operator: SearchOperator, value: any }[];
    ref_id         ?: any;
    name           ?: any;
    source_type    ?: TemplateType;
    source_id      ?: any;
    seq_no         ?: string;
    deal_seq_no    ?: string;
    customer_seq_no?: string;
    activity_seq_no?: string;
}

export type DataTemplate = {
    type           : string,
    category      ?: string,
    customer_id   ?: string | number,
    deal_id       ?: string | number,
    default_fields : Field[],
    dynamic_fields : Field[],
    source ?: {
        ref_id : string,
        type : TemplateType,
    }
};

export type DataLevel = DataTemplate & {
    id      : string,
    seq_no  : string,
    category: string,
    status  : string,
};

export type UpdateLog = {
    name    ?: string,
    datetime : string,
}

export type DataRef = {
    ref_id: string,
    type  : number | string,
}

export type SourceRef = {
    ref_id: string,
    type  : number,
}

export type ProductRef = {
    amount   ?: number,
    currency ?: string,
}

export type DataRefLevel = DataTemplate & DataRef & {
    seq_no   : string,
    source  ?: SourceRef,
    product ?: ProductRef,
    category : string,
    status   : string,
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

export type PaginatedRequst = {
    page ?: number,
    limit?: number,
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
}

export type CheckInOutOptions = {
    start?: Moment,
    end  ?: Moment,
}

export type SyncAssetAttachListOptions = {
    data: {
        type  : TemplateType,
        ref_id: string,
        assets: string[],
    }
}

export type AssetMapOptions = {
    type    : TemplateType,
    asset_id: string,
}

export type UploadAttachmentOptions = {
    field: Field,
    type : FieldType,
    file : Blob,
};

export type PermissionStruct = {
    user      : string[],
    department: string[],
}

export type Permission = {
    assign: PermissionStruct,
    view  : PermissionStruct,
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
    PF       = 13,
};

export enum FieldType {
    Default = 'default',
    Dynamic = 'dynamic',
};

export enum SearchOperator {
    Equal            = 'eq',
    NotEqual         = 'ne',
    LessThan         = 'lt',
    GreaterThan      = 'gt',
    LessThanEqual    = 'lte',
    GreaterThanEqual = 'gte',
}

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

    async getAssetMapping<T = string[]>(params: AssetMapOptions): Promise<Response<T>|never> {
        return await this.call<T>('/asset-mapping', { params });
    }

    async syncAttachAssetList(option: SyncAssetAttachListOptions): Promise<Response<Boolean>|never> {
        try {
            return await this.call<Boolean>('/asset-attach-list', {
                method: 'PATCH',
                data  : option.data
            });
        } catch (error) {
            console.error(`Error syncing attach asset list`, error);
            throw error; // Rethrow the error for handling at higher level
        }
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
            const res = await this.call('/data/status', {
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
            console.log(res);
            return true;
        } catch (error) {
            console.error(`Error update status process`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

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

    async allStatusLog<T = (UpdateLog & { name : string })[]>(type: TemplateType, ref_id: string, option : PaginatedRequst = {}): Promise<Response<T>|never> {
        try {
            let params: any = Object.assign({}, option, { type, ref_id });
            return await this.call<T>('/data/status/all-logs', {
                method: 'GET',
                params,
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

    async getAttachments<T = DataRefLevel>(type: TemplateType, ref_id: string): Promise<Response<T>|never> {
        try {
            return await this.call<T>('/data/attachment', {
                params: {
                    type,
                    ref_id,
                }
            }, 'v2');
        } catch (error) {
            console.error(`Error fetching detail attachment`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    async uploadAttachment(type: TemplateType, ref_id: string, data: UploadAttachmentOptions): Promise<Response<string>>|never {
        try {
            let formData = new FormData();
            formData.append('type', `${type}`);
            formData.append('ref_id', ref_id);
            formData.append('lbl_id', data.field.lbl_id);
            formData.append('field_type', data.type);
            formData.append('file', data.file);
            return await this.call<string>('/data/attachment', {
                method: 'POST',
                data  : formData,
            });
        } catch (error) {
            console.error(`Error uploading attachment for ref_id ${ref_id}:`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    // to get user account permission based on profileid passed
    async getPermissions<T = Permission>(type: TemplateType, ref_id: string): Promise<Response<T>|never> {
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

    async savePermissions(type: TemplateType, ref_id: string, perm: Permission): Promise<Response<Boolean>|never> {
        try {
            return await this.call<Boolean>('/data/permission', {
                method: 'PATCH',
                params: {
                    type,
                    ref_id,
                },
                data: perm
            });
        } catch (error) {
            console.error(`Error updating permissions for ref_id ${ref_id}:`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    async saveComment(type: TemplateType, ref_id: string, content: string): Promise<Response<any>|never> {
        try {
            return await this.call<Boolean>('/add-comment', {
                method: 'POST',
                data: {
                    type,
                    ref_id,
                    content
                }
            });
        } catch (error) {
            console.error(`Error adding comment for ref_id ${ref_id}:`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    async getJobTravelList(ref_id: string, options?: CheckInOutOptions): Promise<Response<any>|never> {
        try {
            let params: any = {
                type: TemplateType.Job,
                ref_id,
            };
            if (options && options.start) {
                params.start = options.start.format('YYYY-MM-DD HH:mm:ss');
            }
            if (options && options.end) {
                params.end = options.end.format('YYYY-MM-DD HH:mm:ss');
            }
            console.log(params);
            return await this.call<Boolean>('/data/checkin', {
                method: 'GET',
                params
            });
        } catch (error) {
            console.error(`Error fetching travel list for ref_id ${ref_id}:`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    async getUsers<T = string[]>(): Promise<Response<T>|never> {
        try {
            return await this.call<T>('/users', {
                method: 'GET',
            });
        } catch (error) {
            console.error(`Error fetching user list:`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    async getDepartments<T = string[]>(): Promise<Response<T>|never> {
        try {
            return await this.call<T>('/departments', {
                method: 'GET',
            });
        } catch (error) {
            console.error(`Error fetching department list:`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    private async call<T = any, R = Response<T>>(path: string, options: AxiosRequestConfig = {}, version: string = 'v1'): Promise<R|never> {
        options.method  = options.method || 'GET';
        options.headers = {
            key    : this.apiKey,
            secret : this.apiSecret,
            ...options.headers
        }
        let resp = await axios(this.url(path, version), options);
        return resp.data as R;
    }

    private url(path: string, version: string = 'v1'): string {
        let url = this.baseUrl;
        if (!url.endsWith('/')) {
            url += '/';
        }
        url = `${url}${version}/`;
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
        let field = this.getField(lbl_id);
        if (field) {
            field.value = value;
        }
        return this;
    }

    setValueByLabel(label: string, value: any) {
        let field = this.getFieldByLabel(label);
        if (field) {
            field.value = value;
        }
        return this;
    }

    getValue(lbl_id: string) {
        let field = this.getField(lbl_id);
        return field?.value;
    }

    getValueByLabel(label: string) {
        let field = this.getFieldByLabel(label);
        return field?.value;
    }

    getField(lbl_id: string): Field | undefined {
        return this.fields.find(f => f.lbl_id == lbl_id);
    }

    getFieldByLabel(label: string): Field | undefined {
        return this.fields.find(f => f.label == label);
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

    async fail(error_code: string = '') {
        return await axios.post(this.url, { status: -1, error_code });
    }
}
