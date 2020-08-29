//import Peer from 'peerjs';
//const socket = io('http://localhost:3000');
const socket = io('https://stream3005phamdinh01.herokuapp.com/');


$('#div-chat').hide(); // Khi khởi động lên Ẩn div_Chat

let customConfig;

$.ajax({
  url: "https://service.xirsys.com/ice",
  data: {
    ident: "vancovermobi",
    secret: "f2915c82-e9d0-11ea-b83d-0242ac150002",
    domain: "vancovermobi.github.io",
    application: "default",
    room: "default",
    secure: 1
  },
  success: function (data, status) {
    // data.d is where the iceServers object lives
    customConfig = data.d;
    console.log(customConfig);
  },
  async: false
});

socket.on('DANH_SACH_ONLINE', arrUserInfo => {
    $('#div-chat').show();   // đăng nhập thành công => hiện div_chat
    $('#div-dang-ky').hide();

    // console.log(arrUserInfo); // hiện danh sách tên username kiểu Mảng
    arrUserInfo.forEach(user => {   
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);    
    });
    socket.on('CO_NGUOI_DUNG_MOI', user => {
        console.log(user);
        const { ten, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${ten}</li>`);
    });
    socket.on('AI_DO_NGAT_KET_NOI', peerId => {
        $(`#${peerId}`).remove();
    });
});

socket.on('DANG_KY_THAT_BAI', () => alert ('Vui long chon username khac !'));

function openStream(){
    const config = { audio : false, video : true};
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream){
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}
// openStream()
// .then(stream => playStream('localStream', stream));

// const peer = new Peer ();  // lấy id từ peerjs cấp ngẫu nhiên ,mõi lần chạy
const peer = new Peer({ 
    host : "0.peerjs.com" , 
    secure : false , 
    initiator: true,
    config: customConfig 
});
peer.on('open', id => {
    $('#my-peer').append(id)  
    // btn SignUp
    $('#btnSignUp').click(() => {
    const username = $('#txtUsername').val();
    socket.emit('NGUOI_DUNG_DANG_KY', {ten: username, peerId: id}); // gán mõi username là 1 peerId
    });
});

//Caller
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    openStream().then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => 
        playStream('remoteStream', remoteStream));
    });
});

// answer
peer.on('call' , call => {
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => 
        playStream('remoteStream', remoteStream));
    });
});
// Bắt sự kiện click user
$('#ulUser').on('click', 'li', function() {
    const id = $(this).attr('id');
    console.log(id);
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});