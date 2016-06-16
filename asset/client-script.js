(function() {

  function subscribe(url, callback) {
    var source = new window.EventSource(url);

    source.onmessage = function(e) {
      callback(e.data);
    };

    source.onerror = function(e) {
      if (source.readyState == window.EventSource.CLOSED) return;

      console.log('sse error', e);
    };

    return source.close.bind(source);
  }

  // 监听/eventstream发送的消息，然后刷新浏览器
  subscribe('/eventstream', function(data) {
    if (data && /reload/.test(data)) {
      window.location.reload();
    }
  });

}());