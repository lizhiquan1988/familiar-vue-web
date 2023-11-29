<script>
const LoginFlag=localStorage.getItem('loginFlag') === null? false: localStorage.getItem('loginFlag');
const token=localStorage.getItem('token') === null? "": localStorage.getItem('token');
const userId=localStorage.getItem('userId') === null? "": localStorage.getItem('userId');
  export default
  {
    LoginFlag,
    token,
    userId,
  }
</script>
