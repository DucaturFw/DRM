import axios;

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
    stage: number | StageInfo;
    user_by: number | User;
    user_to: number[] | User[];
    seen: boolean;
    event_type: "fin"| "open" | "disp_close"  | "disp_open";
}

class DrmApi {
    private _login: string;
    private _password: string;
    public endpoint: string;
    private defaultHeaders = {};

    constructor({login, password, endpoint}) {
        this._login = login;
        this._password = password;
        this.endpoint = endpoint;
        this.defaultHeaders = {
            'Content-Type': 'applications/json',
            'Authorization': Buffer.from(`${this._login}:${this._password}`).toString('base64'),
        }
    }

    private _patch(endpoint, data, query = {}, headers = {}, params = {}) {
        return axios.patch(`${this.endpoint}/${endpoint}`, {
            params: query,
            headers: headers || this.defaultHeaders,
            ...params
          })
    }

    private _post(endpoint, data, query = {}, headers = {}, params = {}) {
        return axios.post(`${this.endpoint}/${endpoint}`, data, {
            params: query,
            headers: headers || this.defaultHeaders,
            ...params
          })
    }

    private _get(endpoint, query = {}, headers = {}, params = {}) {
        return axios.get(`${this.endpoint}/${endpoint}`, {
            params: query,
            headers: headers || this.defaultHeaders,
            ...params
          })
    }

    getEvents(...args) { return this._get('events', ...args); }
    getUsers(...args) { return this._get('users', ...args); }
    getStages(...args) { return this._get('stages', ...args); }
    getCases(...args) { return this._get('contracts', ...args); }

    update<T>(endpoint, id: number, data: Partial<T>, ...args) {
        return this._patch(`${endpoint}/${id}/`, data, ...args);
    }
    updateCase = (id, data, ...args) => this.update<CaseInfo>('contracts', id, data, ...args);
    updateUser = (id, data, ...args) => this.update<User>('users', id, data, ...args);
    updateUserInfo = (id, data, ...args) => this.update<UserInfo>('userinfo', id, data, ...args);
    updateStage = (id, data, ...args) => this.update<StageInfo>('stages', id, data, ...args);
    updateEvent = (id, data, ...args) => this.update<NotifyEvent>('events', id, data, ...args);

    create<T>(endpoint, data: Partial<T>, ...args) {
        return this._post(`${endpoint}`, data, ...args);
    }
    createCase = (data, ...args) => this.create<CaseInfo>('contracts', data, ...args);
    createUser = (data, ...args) => this.create<User>('users', data, ...args);
    createUserInfo = (data, ...args) => this.create<UserInfo>('userinfo', data, ...args);
    createStage = (data, ...args) => this.create<StageInfo>('stages', data, ...args);
    createEvent = (data, ...args) => this.create<NotifyEvent>('events', data, ...args);

    get<T>(endpoint, id: number, ...args) {
        return this._get(`${endpoint}/${id}`, ...args);
    }
    getCase = (id, data, ...args) => this.get<CaseInfo>('contracts', id, ...args);
    getUser = (id, data, ...args) => this.get<User>('users', id, ...args);
    getUserInfo = (id, data, ...args) => this.get<UserInfo>('userinfo', id, ...args);
    getStage = (id, data, ...args) => this.get<StageInfo>('stages', id, ...args);
    getEvent = (id, data, ...args) => this.get<NotifyEvent>('events', id, ...args);
}

export default DrmApi;