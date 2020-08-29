//const socket = io('http://localhost:3000');
const socket = io('https://stream3005phamdinh01.herokuapp.com/');
$('#div-chat').hide();

socket.on('DANH_SACH_ONLINE', arrUserInfo => {
    $('#div-chat').show();
    $('#div-dang-ky').hide();

    console.log(arrUserInfo);
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

//const peer = new Peer ();
//const peer = new Peer({key: '26pce8r38qi00000' }); 
//peer.on('open', id => console.log(id));
const peer = new Peer({ 
    host : "0.peerjs.com" , 
    secure : false , 
    initiator: true,
    port : 443,
    path : '/ peerjs'
});

peer.on('open', id => {
    $('#my-peer').append(id)
    // btn SignUp
    $('#btnSignUp').click(() => {
    const username = $('#txtUsername').val();
    socket.emit('NGUOI_DUNG_DANG_KY', {ten: username, peerId: id});
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
