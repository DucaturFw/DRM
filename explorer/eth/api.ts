import axios, {AxiosPromise} from 'axios';

export type UserInfo = {
    eth_account: string;
    organization_name: string;
    tax_num: string;
    payment_num: string;
    files?: string[];
    user?: User;
}

export type User = {
    id?: number;
    name: string;
    family_name: string;
    email: string;
    info: UserInfo;
    judge: boolean;
}

export type StageInfo = {
    id: number;
    start: string;
    owner: number | User;
    dispute_start_allowed: string;
    dispute_started: string;
    dispute_starter: number | User;
    contract: number | CaseInfo;
    result_file?: string;
}

export type CaseInfo = {
    party: number[] | User[];
    files: string;
    finished: 0 | 1 | 2;
    stages: StageInfo[];
}

export type Partial<T> = {
    [P in keyof T]?: T[P];
}

export type NotifyEvent = {
    creation_date: string;
    contract: number | CaseInfo;
    stage: number | StageInfo;
    user_by: number | User;
    address_by: number;
    filehash: string;
    finished: boolean;
    user_to: number[] | User[];
    seen: boolean;
    event_type: "fin"| "open" | "disp_close"  | "disp_open";
}

class DrmApi {
    private _login: string;
    private _password: string;
    public endpoint: string;
    private defaultHeaders = {};

    constructor(login: string, password: string, endpoint: string) {
        this._login = login;
        this._password = password;
        this.endpoint = endpoint;
        this.defaultHeaders = {
            'Content-Type': 'applications/json',
            'Authorization': Buffer.from(`${this._login}:${this._password}`).toString('base64'),
        }
    }

    private _patch(endpoint: string, data: any, query = {}, headers = {}, params = {}) {
        return axios.patch(`${this.endpoint}/${endpoint}`, data,{
            params: query,
            headers: headers || this.defaultHeaders,
            ...params
          })
    }

    private _post(endpoint:string, data: any, query = {}, headers = {}, params = {}) {
        return axios.post(`${this.endpoint}/${endpoint}`, data, {
            params: query,
            headers: headers || this.defaultHeaders,
            ...params
          })
    }

    private _get(endpoint: string, query = {}, headers = {}, params = {}) {
        return axios.get(`${this.endpoint}/${endpoint}`, {
            params: query,
            headers: headers || this.defaultHeaders,
            ...params
          })
    }

    getEvents(...args: any[]) { return this._get('events', ...args); }
    getUsers(...args: any[]) { return this._get('users', ...args); }
    getStages(...args: any[]) { return this._get('stages', ...args); }
    getCases(...args: any[]) { return this._get('contracts', ...args); }

    update<T>(endpoint: string, id: number, data: Partial<T>, ...args: any[]) {
        return this._patch(`${endpoint}/${id}/`, data, ...args);
    }
    updateCase = (id: number, data: Partial<CaseInfo>, ...args: any[]) => this.update<CaseInfo>('contracts', id, data, ...args);
    updateUser = (id: number, data: Partial<User>, ...args: any[]) => this.update<User>('users', id, data, ...args);
    updateUserInfo = (id: number, data: Partial<UserInfo>, ...args: any[]) => this.update<UserInfo>('userinfo', id, data, ...args);
    updateStage = (id: number, data: Partial<StageInfo>, ...args: any[]) => this.update<StageInfo>('stages', id, data, ...args);
    updateEvent = (id: number, data: Partial<NotifyEvent>, ...args: any[]) => this.update<NotifyEvent>('events', id, data, ...args);

    create<T>(endpoint: string, data: Partial<T>, ...args: any[]) {
        return this._post(`${endpoint}`, data, ...args);
    }
    createCase = (data: Partial<CaseInfo>, ...args: any[]) => this.create<CaseInfo>('contracts', data, ...args);
    createUser = (data: Partial<User>, ...args: any[]) => this.create<User>('users', data, ...args);
    createUserInfo = (data: Partial<UserInfo>, ...args: any[]) => this.create<UserInfo>('userinfo', data, ...args);
    createStage = (data: Partial<StageInfo>, ...args: any[]) => this.create<StageInfo>('stages', data, ...args);
    createEvent = (data: Partial<NotifyEvent>, ...args: any[]) => this.create<NotifyEvent>('events', data, ...args);

    get<T>(endpoint: string, id: number, ...args: any[]): AxiosPromise<T> {
        return this._get(`${endpoint}/${id}`, ...args);
    }
    getCase = (id: number, ...args: any[]) => this.get<CaseInfo>('contracts', id, ...args);
    getUser = (id: number, ...args: any[]) => this.get<User>('users', id, ...args);
    getUserInfo = (id: number, ...args: any[]) => this.get<UserInfo>('userinfo', id, ...args);
    getStage = (id: number, ...args: any[]) => this.get<StageInfo>('stages', id, ...args);
    getEvent = (id: number, ...args: any[]) => this.get<NotifyEvent>('events', id, ...args);
}

export default DrmApi;