
import { IonicPage, NavController,MenuController } from 'ionic-angular';
import { Component} from '@angular/core'
import { App } from 'ionic-angular/components/app/app';
import { TrenlistServiceProvider } from '../../providers/trenlist-service/trenlist-service';
import { NetworkDetectProvider } from '../../providers/network-detect/network-detect';
import { CihazPage } from '../cihaz/cihaz';
import { User } from '../../models/user-model';
@IonicPage()
@Component({
  selector: 'page-tren',
  templateUrl: 'tren.html',
})
export class TrenPage  {
  responseData : any;
  dataSetTrenL : any=[];
  term: string = '';
  private statusScroll:boolean=true;
  private tlStart:number;
  private activeuser={name:'',sessionstime:'',role:''};
    constructor(public navCtrl: NavController, 
      public trenlistservice:TrenlistServiceProvider,
      public app: App,
      public menu: MenuController,
      private netProvider:NetworkDetectProvider,
      private user:User){  
      this.netProvider.presentSpinner();//spinner aktif olsun
      this.activeuser.sessionstime=new Date().toString();
      this.activeuser.name=this.user.getUserName();
      this.activeuser.role=this.user.getRole();
      this.menu.enable(true);//menü aktif edilir          
      this.tlStart=0;
      this.netProvider.setConnectionStatus();
      if(this.netProvider.getConnectionStatus()){
      this.getTrenList(this.tlStart);//Sayfa yüklenirken 0 değeriyle alıyorum 
      }
      this.netProvider.dismissSpinner();
  }
  ionViewDidEnter() {
    this.netProvider.CheckConnection(); //Uygulama yüklenirken kontrol ediyorum
  }
   // ion input fire oldukça filter çalışssın :)
   searchFn(ev: any) {
    this.term = ev.target.value;
  }
  getTrenList(tlStart) {
    return new Promise(resolve => {      
      this.trenlistservice.getDataforCL(this.tlStart)
      .then((result) => {  
        if(result!=null)
        {
          this.dataSetTrenL=this.dataSetTrenL.concat(result);//Apiden gelen verileri birleştirme       
          resolve(true);             
        } 
        else{         
          resolve(false); //scroll dursun       
        }                    
      }, (err) => {
        this.netProvider.PrepareAlert(err); //sunucudan dönen  hatayı gösterelim
              });                
    });
  }

  doInfinite(infiniteScroll:any): Promise<any> {
    if(this.netProvider.getConnectionStatus()){
    this.tlStart+=20;  
      return new Promise((resolve) => {
        setTimeout(() => {
          this.getTrenList(this.tlStart)
          .then((result) => { 
            if(result==false)//Veri kalmamış ise scroll işlemini durduryorum
            {       
              infiniteScroll.enable=false;
              infiniteScroll.complete();//Scroll işlemi tamamlandı
              this.statusScroll=false;
            }           
          }, (err) => {
            this.netProvider.PrepareAlert(err); //sunucudan dönen  hatayı gösterelim
                  });  
          resolve();
        }, 500);
      })
    }
    }

  goToTrenDetail(trenData:any)
  {
    if(this.netProvider.getConnectionStatus()){ //Detay Sayfasına Gitmeden evvel kontrol ediyoruz
    this.navCtrl.push(CihazPage,trenData);
  }
  else{
    this.netProvider.displayNetworkUpdate("İnternet Bağlantınız Bulunmamaktadır");
  }
  }
  backToPage(){
     const root = this.app.getRootNav();
     root.popToRoot();
  }
  ionViewWillLeave(){
    this.netProvider.leaveNetworkSubscribe();//View den ayrılırken boşver 
    }

}