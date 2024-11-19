import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import moment, { Moment } from 'moment';
import { TemplateType, Response, PaginatedRequest, PaginatedResponse,
    DataTemplate, BaseAsset, DataLevel, DataRef, DataRefLevel, Field, AssetFilterOptions,
    AssetMapOptions, SyncAssetAttachListOptions, UploadAttachmentOptions,
    Permission, UpdateLog, CheckInOut, CheckInOutOptions, SearchOptions, AttachProduct,
    ResponseTemplate, GetAttachProduct, ProductFilterOptions, GetProduct, TravelDataResponse
} from './types';
import 'moment-timezone';

export * from './types';

export class SDK {
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

    async getProducts<T = GetProduct[]>(options?: ProductFilterOptions): Promise<PaginatedResponse<T>|never> {
        let params: any = options;
        if (options?.filter) {
            params.filter = JSON.stringify(options.filter);
        }
        return await this.call<T, PaginatedResponse<T>>('/product', { params });
    }

    async getAttachedProducts<T = GetAttachProduct[]>(type: TemplateType, ref_id: string): Promise<ResponseTemplate<T>|never> {
        try {
            let resp = await this._call<ResponseTemplate<T>>('/product-attached', {
                params: {
                    type,
                    ref_id,
                }
            });
            return resp.data;
        } catch (error) {
            console.error(`Error fetching attached product list`, error);
            throw error;
        }
    }

    async attachProduct(type: TemplateType, ref_id: string, data: AttachProduct[]): Promise<Boolean|never> {
        try {
            await this.call('/add-product', {
                method: 'POST',
                data  : {
                    type,
                    ref_id,
                    data
                }
            });
            return true;
        } catch (error) {
            console.error(`Error attaching product to resource`, error);
            throw error;
        }
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

    async allStatusLog<T = (UpdateLog & { name : string })[]>(type: TemplateType, ref_id: string, option : PaginatedRequest = {}): Promise<Response<T>|never> {
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
            if (data.filetype == "file") {
                formData.append('file', data.file);
            } else {
                formData.append('link', data.link.toString());
            }
            formData.append('replace', (data.replace ?? false) ? '1' : '0');
            if (data.filename) {
                formData.append('filename', data.filename);
            }
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

    async getJobTravelList(ref_id: string, options?: CheckInOutOptions): Promise<Response<CheckInOut[]>|never> {
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
            return await this.call<CheckInOut[]>('/data/checkin', {
                method: 'GET',
                params
            });
        } catch (error) {
            console.error(`Error fetching travel list for ref_id ${ref_id}:`, error);
            throw error; // Rethrow the error for handling at higher level
        }
    }

    async getMileageAndDuration(ref_id: string): Promise<Response<TravelDataResponse>|never> {
        try {
            const params: any = {
                type: TemplateType.Job,
                ref_id,
            };

            // Call the API endpoint
            return await this.call<TravelDataResponse>('/data/travel', {
                method: 'GET',
                params,
            });
        } catch (error) {
            console.error(`Error fetching travel data for ref_id ${ref_id}:`, error);
            throw error; // Rethrow the error for higher-level handling
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
        let resp = await this._call<R>(path, options, version);
        return resp.data;
    }

    private async _call<T = any>(path: string, options: AxiosRequestConfig = {}, version: string = 'v1'): Promise<AxiosResponse<T>> {
        options.method  = options.method || 'GET';
        options.headers = {
            key    : this.apiKey,
            secret : this.apiSecret,
            ...options.headers
        }
        return await axios<any, AxiosResponse<T>>(this.url(path, version), options);
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

export class DataHelper<T extends DataTemplate> {
    private default: FieldHelper;
    private dynamic: FieldHelper;

    constructor(public ref: T) {
        this.default = new FieldHelper(ref.default_fields);
        this.dynamic = new FieldHelper(ref.dynamic_fields);
    }

    public defaultFields(): FieldHelper {
        return this.default;
    }

    public dynamicFields(): FieldHelper {
        return this.dynamic;
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

export function toTemplateType(type: string): TemplateType | false {
    const WEBHOOK: { [key: string]: TemplateType } = {
        "customer"   : TemplateType.Customer,
        "deal"       : TemplateType.Deal,
        "activity"   : TemplateType.Asset,
        "asset"      : TemplateType.Asset,
        "product"    : TemplateType.Product,
        "DR01"       : TemplateType.DF01,
        "DR02"       : TemplateType.DF02,
        "DR03"       : TemplateType.DF03,
        "DR04"       : TemplateType.DF04,
        "DR05"       : TemplateType.DF05,
        "DR06"       : TemplateType.DF06,
        "DR07"       : TemplateType.DF07,
        "public_form": TemplateType.PF,
    };
    if (type in WEBHOOK) {
        return WEBHOOK[type];
    }
    return false;
};

export async function rescue<T = any>(callback: () => Promise<T>, def?: T): Promise<T | undefined> {
    try {
        return await callback();
    } catch (error) {
        return def;
    }
}

export default SDK;
