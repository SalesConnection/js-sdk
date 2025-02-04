import { Moment } from "moment"
import { URL } from 'url';

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
};

export interface Filter {
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
};

export type DataTemplate = {
    type           : string,
    category      ?: string,
    customer_id   ?: string | number,
    deal_id       ?: string | number,
    activity_id   ?: string | number,
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
    subtotal?: number,
    tax     ?: number,
    amount  ?: number,
    currency?: string,
}

export type DataRefLevel = DataTemplate & DataRef & {
    seq_no         : string,
    source        ?: SourceRef,
    product       ?: ProductRef,
    category       : string,
    status         : string,
    pdf_url       ?: string | null,
    public_pdf_url?: string | null,
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

export type BaseLocation = {
    id  : string,
    type: TemplateType,
};

export type GetProduct = BaseProduct & {
    uom_list: string[],
};

export type AttachProduct = BaseProduct & {
    uom_name      ?: string,
    dynamic_fields : Field[],
};

export type GetAttachProduct = AttachProduct & {
    subtotal?: number,
    tax     ?: number,
    total   ?: number,
    from    ?: BaseLocation,
    to      ?: BaseLocation,
};

export type CheckInOut = {
    gps            : [ number | string, number | string ] | null,
    type           : 'Check-In' | 'Check-Out' | 'Travelling',
    datetime       : string | Moment,
    name           : string,
    start_time     : string | Moment,
    end_time       : string | Moment,
    travel_distance: number,
};

export type Response<T = any> = {
    data  : T,
    error?: any[],
};

export type ResponseTemplate<T = any> = Response<T> & {
    dynamic_fields_templates: Field[],
};

export type PaginatedRequest = {
    page ?: number,
    limit?: number,
};

export type PaginatedResponse<T = any> = Response<T> & {
    current_page: number,
    per_page    : number,
    last_page   : number,
    total       : number,
};

export type SearchOptions = {
    category?: string,
    filter  ?: Filter,
};

export type AssetFilterOptions = {
    type  ?: TemplateType,
    ref_id?: string,
    filter?: Filter,
    page  ?: number,
};

export type ProductFilterOptions = {
    page  ?: number,
    filter?: {
        name?: string,
    },
};

export type CheckInOutOptions = {
    start ?: Moment,
    end   ?: Moment,
    travel?: Boolean
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
    field    : Field,
    type     : FieldType,
    filetype : "file" | "link",
    replace ?: boolean,
    filename?: string,
} & (
    | { filetype: "file", file: Blob }
    | { filetype: "link", link: URL }
);

export type PermissionStruct = {
    user      : string[],
    department: string[],
}

export type Permission = {
    assign: PermissionStruct,
    view  : PermissionStruct,
}
