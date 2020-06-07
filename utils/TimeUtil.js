exports.trackDurationFormart = (trackDuration) => {
    const minutes = "0" + Math.floor(trackDuration / 60);
    const seconds = "0" + Math.floor(trackDuration - minutes * 60);
    return minutes.substr(-2) + " : " + seconds.substr(-2);
}