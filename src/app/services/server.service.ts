import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  constructor(private http: HttpClient) { }

  private async request(method: string, url: string, data?: any) {

    const result = this.http.request(method, url, {
      body: data,
      responseType: 'json',
      observe: 'body',
      withCredentials: true
    });

    return new Promise((resolve, reject) => {
      result.subscribe(resolve, reject);
    });
  }

  get_List(slash_url) {
    return this.request('GET', `${environment.serverUrl}/${slash_url}`);
  }
  get_Value(data,slash_url){
    return this.request('POST', `${environment.serverUrl}/${slash_url}/${data[0]}`, data);
  }
  add_List(data,slash_url) {
    return this.request('POST', `${environment.serverUrl}/${slash_url}`, data);
  }
  update_List(data,slash_url) {
    return this.request('PUT', `${environment.serverUrl}/${slash_url}/${data.ID}`, data);
  }
  delete_List(data,slash_url) {
    return this.request('DELETE', `${environment.serverUrl}/${slash_url}/${data}`, data);
  }

  get_List_CF(data,slash_url){
    console.log(data)
    return this.request('POST', `${environment.serverUrl}/${slash_url}`,data);
  }

}
